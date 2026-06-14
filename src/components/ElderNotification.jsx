import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ElderNotification() {
  const { cartItems } = useCart();
  const elderItems = cartItems.filter((item) => item.elderRequest);

  if (elderItems.length === 0) return null;

  return (
    <div className="bg-purple-50 border-b border-purple-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📌</span>
          <p className="text-sm text-purple-800">
            <span className="font-bold">Mom added {elderItems.length} item{elderItems.length > 1 ? 's' : ''}</span> to your cart
          </p>
        </div>
        <Link
          to="/cart"
          className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-medium hover:bg-purple-700 transition-colors"
        >
          Review →
        </Link>
      </div>
    </div>
  );
}

export default ElderNotification;
