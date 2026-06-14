import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ProductCard({ product }) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [friendRec, setFriendRec] = useState(null);

  const cartItem = cartItems.find((item) => item.id === product.id);
  const inCart = !!cartItem;

  // Fetch friend recommendation for this product
  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/api/friends/recommendations/${user.phone}`)
        .then(r => r.json())
        .then(data => {
          const rec = (data.recommendations || []).find(r => r.productId === product.id);
          if (rec) setFriendRec(rec);
        })
        .catch(() => {});
    }
  }, [user, product.id]);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleIncrease = () => {
    addToCart(product, 1);
  };

  const handleDecrease = () => {
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeFromCart(product.id);
      } else {
        updateQuantity(product.id, cartItem.quantity - 1);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col relative">
      {product.deal && (
        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
          {Math.round(((product.price - product.dealPrice) / product.price) * 100)}% OFF
        </div>
      )}
      <Link to={`/product/${product.id}`} className="block p-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-32 object-cover rounded mb-2"
        />
        <h3 className="text-xs font-medium text-gray-900 line-clamp-2 hover:text-amazon-orange transition-colors leading-snug">
          {product.name}
        </h3>
      </Link>
      <div className="px-3 pb-3 flex flex-col flex-1">
        <StarRating rating={product.rating} />
        <div className="mt-1.5">
          {product.deal ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-red-600">₹{product.dealPrice}</span>
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            </div>
          ) : (
            <p className="text-base font-bold text-gray-900">₹{product.price}</p>
          )}
        </div>
        {product.protein > 0 && (
          <p className="text-xs text-green-700 mt-0.5">{product.protein}g protein/{product.servingSize}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">🚀 10-min delivery</p>
        {friendRec && (
          <div className="mt-1.5 bg-pink-50 border border-pink-200 rounded p-1.5">
            <p className="text-xs text-pink-700 flex items-center gap-1">
              <span>❤️</span> <span className="font-medium">{friendRec.friendName}</span> ordered {friendRec.orderCount}x
            </p>
            {friendRec.comment && (
              <p className="text-xs text-pink-600 italic mt-0.5">"{friendRec.comment}"</p>
            )}
          </div>
        )}
        <div className="mt-auto pt-2">
          {inCart ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-300 rounded-md">
              <button
                onClick={handleDecrease}
                className="px-3 py-1.5 text-green-700 font-bold hover:bg-green-100 rounded-l-md transition-colors"
              >
                −
              </button>
              <span className="text-sm font-bold text-green-700">{cartItem.quantity} in cart</span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1.5 text-green-700 font-bold hover:bg-green-100 rounded-r-md transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-1.5 px-3 rounded-md text-xs transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
