import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const INR = '\u20B9';

function Checkout() {
  const { cartItems, getCartTotal, getCartCount, splitPeople, splitEnabled, getSplitTotals } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [address, setAddress] = useState('');

  const getItemPrice = (item) => item.deal ? item.dealPrice : item.price;
  const cartTotal = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setPlacing(true);

    // Record each cart item as an order on the server
    for (const item of cartItems) {
      for (let i = 0; i < item.quantity; i++) {
        try {
          await fetch(`${API_BASE}/api/orders/record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: user.phone,
              productId: item.id,
              productName: item.name,
            }),
          });
        } catch (err) {
          console.log('Could not record order:', err);
        }
      }
    }

    // Clear cart
    localStorage.removeItem('freshcart-items');
    setPlacing(false);
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Delivering in 10-30 minutes</p>
          <p className="text-sm text-gray-400 mb-6">Order total: {INR}{cartTotal}</p>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-amazon-orange text-white font-bold py-2 px-6 rounded-lg">
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Delivery Address */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your delivery address..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
        />
        <p className="text-xs text-green-600 mt-2">🚀 Delivery in 10-30 minutes</p>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Items ({getCartCount()})</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold">{INR}{getItemPrice(item) * item.quantity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-md p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Payment</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items total:</span>
            <span>{INR}{cartTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery:</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Total:</span>
            <span className="text-amazon-orange">{INR}{cartTotal}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span>💳</span>
          <span>Cash on Delivery / UPI</span>
        </div>
      </div>

      {/* Split Summary */}
      {splitEnabled && splitPeople.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>👥</span> Split Summary
          </h2>
          <div className="space-y-2">
            {Object.entries(getSplitTotals()).map(([person, amount]) => (
              <div key={person} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-700">{person}</span>
                <span className="text-sm font-bold text-amazon-orange">{INR}{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Items marked "Shared" are split equally among all people.</p>
        </div>
      )}

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-4 rounded-lg text-lg transition-colors disabled:opacity-50"
      >
        {placing ? 'Placing Order...' : `Place Order — ${INR}${cartTotal}`}
      </button>
    </div>
  );
}

export default Checkout;
