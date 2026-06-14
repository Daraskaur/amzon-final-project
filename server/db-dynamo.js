import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
  users: process.env.USERS_TABLE || 'freshcart-users',
  orders: process.env.ORDERS_TABLE || 'freshcart-orders',
  friendships: process.env.FRIENDSHIPS_TABLE || 'freshcart-friendships',
  comments: process.env.COMMENTS_TABLE || 'freshcart-comments',
};

// --- Users ---
export async function getUser(phone) {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLES.users,
    KeyConditionExpression: 'phone = :phone',
    ExpressionAttributeValues: { ':phone': phone },
  }));
  return result.Items?.[0] || null;
}

export async function createUser(phone, name) {
  const user = { phone, name, createdAt: Date.now() };
  await docClient.send(new PutCommand({ TableName: TABLES.users, Item: user }));
  return user;
}

// --- Friendships ---
export async function addFriendship(user1, user2) {
  const item = { id: `${user1}_${user2}`, user1, user2, since: Date.now() };
  await docClient.send(new PutCommand({ TableName: TABLES.friendships, Item: item }));
  return item;
}

export async function getFriendships(phone) {
  const result = await docClient.send(new ScanCommand({
    TableName: TABLES.friendships,
    FilterExpression: 'user1 = :phone OR user2 = :phone',
    ExpressionAttributeValues: { ':phone': phone },
  }));
  return result.Items || [];
}

// --- Orders ---
export async function recordOrder(phone, productId, productName) {
  const item = { id: `${phone}_${Date.now()}_${Math.random()}`, phone, productId, productName, timestamp: Date.now() };
  await docClient.send(new PutCommand({ TableName: TABLES.orders, Item: item }));
  return item;
}

export async function getOrdersByPhone(phone) {
  const result = await docClient.send(new ScanCommand({
    TableName: TABLES.orders,
    FilterExpression: 'phone = :phone',
    ExpressionAttributeValues: { ':phone': phone },
  }));
  return result.Items || [];
}

export async function getAllOrders() {
  const result = await docClient.send(new ScanCommand({ TableName: TABLES.orders }));
  return result.Items || [];
}

// --- Comments ---
export async function addComment(phone, productId, comment) {
  const item = { id: `${phone}_${productId}`, phone, productId, comment, timestamp: Date.now() };
  await docClient.send(new PutCommand({ TableName: TABLES.comments, Item: item }));
  return item;
}

export async function getComments() {
  const result = await docClient.send(new ScanCommand({ TableName: TABLES.comments }));
  return result.Items || [];
}
