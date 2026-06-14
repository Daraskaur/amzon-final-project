import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${user.phone}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.log('Could not fetch orders');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Please login first</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <span className="text-4xl">📦</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your order history here.</p>
          <Link to="/" className="bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 border-b px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Order</p>
                    <p className="text-sm font-bold text-gray-900">{order.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Date</p>
                    <p className="text-sm text-gray-900">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Time</p>
                    <p className="text-sm text-gray-900">{order.time}</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                  Delivered
                </span>
              </div>

              {/* Order Items */}
              <div className="px-5 py-3">
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs w-4">{idx + 1}.</span>
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-sm text-gray-900 hover:text-amazon-orange transition-colors"
                      >
                        {item.productName}
                      </Link>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                  {order.itemCount} item{order.itemCount > 1 ? 's' : ''} in this order
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
