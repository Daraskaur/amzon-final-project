import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import serverless from 'serverless-http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- Config ---
const IS_LAMBDA = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const GROQ_KEY = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey: GROQ_KEY });
const PORT = process.env.PORT || 3001;

// --- Database Layer (JSON file for local, DynamoDB for AWS) ---
let db;

if (IS_LAMBDA) {
  // Use DynamoDB in production
  db = await import('./db-dynamo.js');
} else {
  // Local JSON file DB
  const DB_PATH = join(__dirname, 'db.json');

  function loadDB() {
    if (!existsSync(DB_PATH)) {
      const initial = { users: {}, friendships: [], orders: [], comments: {} };
      writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  }

  function saveDB(data) {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  db = {
    async getUser(phone) {
      const data = loadDB();
      return data.users[phone] || null;
    },
    async createUser(phone, name) {
      const data = loadDB();
      data.users[phone] = { phone, name, createdAt: Date.now() };
      saveDB(data);
      return data.users[phone];
    },
    async addFriendship(user1, user2) {
      const data = loadDB();
      data.friendships.push({ user1, user2, since: Date.now() });
      saveDB(data);
    },
    async getFriendships(phone) {
      const data = loadDB();
      return data.friendships.filter(f => f.user1 === phone || f.user2 === phone);
    },
    async recordOrder(phone, productId, productName) {
      const data = loadDB();
      data.orders.push({ phone, productId, productName, timestamp: Date.now() });
      saveDB(data);
    },
    async getOrdersByPhone(phone) {
      const data = loadDB();
      return data.orders.filter(o => o.phone === phone);
    },
    async getAllOrders() {
      const data = loadDB();
      return data.orders;
    },
    async addComment(phone, productId, comment) {
      const data = loadDB();
      data.comments[`${phone}_${productId}`] = { phone, productId, comment, timestamp: Date.now() };
      saveDB(data);
    },
    async getComments() {
      const data = loadDB();
      return Object.values(data.comments);
    },
  };
}

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { phone, name } = req.body;
  if (!phone || !name) return res.status(400).json({ error: 'Phone and name required' });

  let user = await db.getUser(phone);
  if (!user) {
    user = await db.createUser(phone, name);
  }
  res.json({ success: true, user });
});

app.get('/api/auth/user/:phone', async (req, res) => {
  const user = await db.getUser(req.params.phone);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// --- Friends Routes ---
app.post('/api/friends/add', async (req, res) => {
  const { myPhone, friendPhone } = req.body;
  if (!myPhone || !friendPhone) return res.status(400).json({ error: 'Both phones required' });

  const friend = await db.getUser(friendPhone);
  if (!friend) return res.status(404).json({ error: 'User not found. They need to sign up first.' });

  const existing = await db.getFriendships(myPhone);
  const alreadyFriends = existing.find(f =>
    (f.user1 === myPhone && f.user2 === friendPhone) || (f.user1 === friendPhone && f.user2 === myPhone)
  );
  if (alreadyFriends) return res.json({ success: true, message: 'Already friends', friend });

  await db.addFriendship(myPhone, friendPhone);
  res.json({ success: true, friend });
});

app.get('/api/friends/:phone', async (req, res) => {
  const myPhone = req.params.phone;
  const friendships = await db.getFriendships(myPhone);
  const friendPhones = friendships.map(f => f.user1 === myPhone ? f.user2 : f.user1);

  const friends = [];
  for (const p of friendPhones) {
    const user = await db.getUser(p);
    if (user) friends.push(user);
  }
  res.json({ friends });
});

// --- Orders ---
app.post('/api/orders/record', async (req, res) => {
  const { phone, productId, productName } = req.body;
  if (!phone || !productId) return res.status(400).json({ error: 'Phone and productId required' });
  await db.recordOrder(phone, productId, productName);
  res.json({ success: true });
});

app.get('/api/orders/:phone', async (req, res) => {
  const orders = await db.getOrdersByPhone(req.params.phone);

  const grouped = {};
  orders.forEach(order => {
    const orderTime = Math.floor(order.timestamp / 5000) * 5000;
    if (!grouped[orderTime]) grouped[orderTime] = { timestamp: order.timestamp, items: [] };
    grouped[orderTime].items.push(order);
  });

  const history = Object.values(grouped)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((group, idx) => ({
      orderId: `ORD-${String(Object.values(grouped).length - idx).padStart(3, '0')}`,
      date: new Date(group.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date(group.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      items: group.items.map(i => ({ productId: i.productId, productName: i.productName })),
      itemCount: group.items.length,
    }));

  res.json({ orders: history });
});

// --- Comments ---
app.post('/api/comments/add', async (req, res) => {
  const { phone, productId, comment } = req.body;
  if (!phone || !productId || !comment) return res.status(400).json({ error: 'All fields required' });
  await db.addComment(phone, productId, comment);
  res.json({ success: true });
});

// --- Friend Recommendations ---
app.get('/api/friends/recommendations/:phone', async (req, res) => {
  const myPhone = req.params.phone;
  const friendships = await db.getFriendships(myPhone);
  const friendPhones = friendships.map(f => f.user1 === myPhone ? f.user2 : f.user1);

  if (friendPhones.length === 0) return res.json({ recommendations: [] });

  const allOrders = await db.getAllOrders();
  const comments = await db.getComments();

  const friendOrders = {};
  for (const order of allOrders) {
    if (friendPhones.includes(order.phone)) {
      const key = `${order.phone}_${order.productId}`;
      if (!friendOrders[key]) friendOrders[key] = { phone: order.phone, productId: order.productId, productName: order.productName, count: 0 };
      friendOrders[key].count++;
    }
  }

  const recommendations = Object.values(friendOrders)
    .filter(o => o.count >= 3)
    .map(o => {
      const friend = friendPhones.includes(o.phone);
      const comment = comments.find(c => c.phone === o.phone && c.productId === o.productId);
      return {
        productId: o.productId,
        productName: o.productName,
        friendName: o.phone,
        orderCount: o.count,
        comment: comment ? comment.comment : null,
      };
    });

  // Resolve friend names
  for (const rec of recommendations) {
    const user = await db.getUser(rec.friendName);
    if (user) rec.friendName = user.name;
  }

  res.json({ recommendations });
});

// --- Cross-Platform AI Suggestions ---
app.post('/api/cross-suggest', async (req, res) => {
  const { searchQuery, purchaseHistory } = req.body;
  if (!searchQuery || !purchaseHistory || purchaseHistory.length === 0) return res.json({ suggestions: [] });

  try {
    const historyText = purchaseHistory.map(p => `- ${p.name}: ${p.description || p.category}`).join('\n');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'system',
        content: `You are a smart shopping assistant. User previously bought:\n${historyText}\n\nThey search "${searchQuery}" on a quick-delivery grocery app. Suggest 1-2 items compatible with their purchases.\n\nRespond ONLY JSON array (no markdown):\n[{"name":"product","price":number,"reason":"why relevant","tag":"short label"}]\nIf no connection: []`
      }, { role: 'user', content: `Search: "${searchQuery}"` }],
      temperature: 0.5,
    });
    const clean = completion.choices[0].message.content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let suggestions = [];
    try { suggestions = JSON.parse(clean); if (!Array.isArray(suggestions)) suggestions = []; } catch { suggestions = []; }
    res.json({ suggestions });
  } catch (error) {
    console.error('Cross-suggest error:', error.message);
    res.json({ suggestions: [] });
  }
});

// --- Elder Mode ---
const ELDER_PRODUCTS = [
  { id: 101, keyword: "shampoo", name: "Dove Shampoo 340ml", price: 245, historyNote: "ordered 6x before" },
  { id: 102, keyword: "toothpaste", name: "Colgate MaxFresh 150g", price: 99, historyNote: "ordered 4x before" },
  { id: 103, keyword: "soap", name: "Dettol Soap 4 Pack", price: 180, historyNote: "ordered 3x before" },
  { id: 104, keyword: "oil", name: "Fortune Sunflower Oil 1L", price: 140, historyNote: "ordered 8x before" },
  { id: 105, keyword: "atta", name: "Aashirvaad Atta 5kg", price: 280, historyNote: "ordered 10x before" },
  { id: 106, keyword: "tea", name: "Taj Mahal Tea 500g", price: 310, historyNote: "ordered 5x before" },
  { id: 107, keyword: "sugar", name: "Sugar 1kg", price: 48, historyNote: "ordered 7x before" },
  { id: 108, keyword: "detergent", name: "Surf Excel Matic 2kg", price: 450, historyNote: "ordered 3x before" },
  { id: 16, keyword: "chocolate", name: "Cadbury Dark Chocolate 70%", price: 99, historyNote: "ordered 3x before" },
  { id: 5, keyword: "chicken", name: "Chicken Breast Boneless 1kg", price: 350, historyNote: "ordered 4x before" },
  { id: 27, keyword: "paneer", name: "Paneer Fresh 200g", price: 99, historyNote: "ordered 5x before" },
  { id: 4, keyword: "eggs", name: "Country Eggs 12 Pack", price: 99, historyNote: "ordered 8x before" },
  { id: 26, keyword: "dal", name: "Toor Dal 1kg", price: 140, historyNote: "ordered 6x before" },
  { id: 3, keyword: "milk", name: "Amul Taaza Milk 1L", price: 66, historyNote: "ordered 12x before" },
  { id: 12, keyword: "rice", name: "India Gate Basmati Rice 5kg", price: 450, historyNote: "ordered 9x before" },
];

app.post('/api/elder/understand', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const productList = ELDER_PRODUCTS.map(p => `${p.keyword}: ${p.name}`).join('\n');
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'system',
        content: `You are a shopping assistant. A family elder sent a request (Hindi/Hinglish/English). Match to:\n${productList}\n\nRespond ONLY JSON (no markdown):\n{"keyword":"matched_keyword","intent":"brief english description"}\nIf no match: {"keyword":"none","intent":"description"}`
      }, { role: 'user', content: text }],
      temperature: 0.3,
    });
    const clean = completion.choices[0].message.content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let parsed;
    try { parsed = JSON.parse(clean); } catch { parsed = { keyword: 'none', intent: clean }; }
    const matched = ELDER_PRODUCTS.find(p => p.keyword === parsed.keyword);
    console.log(`Elder: "${text}" → ${parsed.keyword} → ${matched ? matched.name : 'no match'}`);
    res.json({ success: !!matched, transcript: text, intent: parsed.intent, keyword: parsed.keyword, product: matched || null });
  } catch (error) {
    console.error('Elder error:', error.message);
    res.status(500).json({ error: 'AI processing failed: ' + error.message });
  }
});

// --- Health Check ---
app.get('/debug', (req, res) => {
  res.json({ status: 'running', mode: IS_LAMBDA ? 'AWS Lambda' : 'Local', ai: 'Groq LLaMA 3.1' });
});

// --- Export for Lambda or run locally ---
if (IS_LAMBDA) {
  // AWS Lambda handler — exported from lambda.js wrapper
}

// Local server
if (!IS_LAMBDA) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Mode: Local (JSON file DB)`);
    console.log(`Groq AI: Ready`);
  });
}

export { app };
