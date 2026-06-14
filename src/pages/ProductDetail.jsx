import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import products from '../data/products.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [comment, setComment] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);
  const [friendComments, setFriendComments] = useState([]);

  const product = products.find((p) => p.id === parseInt(id));

  // Fetch friend comments for this product
  useEffect(() => {
    if (user && product) {
      fetch(`${API_BASE}/api/friends/recommendations/${user.phone}`)
        .then(r => r.json())
        .then(data => {
          const recs = (data.recommendations || []).filter(r => r.productId === product.id);
          setFriendComments(recs);
        })
        .catch(() => {});
    }
  }, [user, product]);

  const handleAddComment = async () => {
    if (!comment.trim() || !user) return;
    try {
      await fetch(`${API_BASE}/api/comments/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, productId: product.id, comment }),
      });
      setCommentSaved(true);
      setTimeout(() => setCommentSaved(false), 3000);
      setComment('');
    } catch (err) {
      console.log('Could not save comment');
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-2 px-6 rounded-md"
        >
          Go back home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const displayPrice = product.deal ? product.dealPrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Added to Cart confirmation */}
      {added && (
        <div className="mb-6 bg-white border border-green-300 rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800">Added to Cart</p>
              <p className="text-sm text-gray-600">{quantity} × {product.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/cart"
              className="bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-2 px-5 rounded-full text-sm transition-colors"
            >
              Go to Cart
            </Link>
            <button
              onClick={() => setAdded(false)}
              className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 px-5 rounded-full text-sm transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg p-6 shadow-md">
        {/* Product Image */}
        <div className="relative flex items-center justify-center bg-gray-50 rounded-lg p-8">
          {product.deal && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
              {Math.round(((product.price - product.dealPrice) / product.price) * 100)}% OFF
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-80 object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          <div className="mb-4">
            <StarRating rating={product.rating} size="lg" />
          </div>

          <div className="border-t border-b py-4 mb-4">
            {product.deal ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-red-600">
                    {'\u20B9'}{product.dealPrice}
                  </p>
                  <p className="text-lg text-gray-400 line-through">
                    {'\u20B9'}{product.price}
                  </p>
                </div>
                <p className="text-sm text-red-600 mt-1 font-medium">
                  You save {'\u20B9'}{product.price - product.dealPrice}!
                </p>
              </div>
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                <span className="text-base text-gray-500 font-normal">{'\u20B9'}</span>
                {product.price}
              </p>
            )}
            <p className="text-sm text-green-600 mt-1 font-medium">
              FREE delivery in 10-30 minutes
            </p>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              {product.category}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-700 font-medium">✓ In Stock</span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mb-6 mt-4">
            <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
              Qty:
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              className="w-full bg-amazon-yellow hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full text-sm transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 px-6 rounded-full text-sm transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Friend Reviews Section */}
      {friendComments.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            ❤️ Friends who love this
          </h3>
          <div className="space-y-3">
            {friendComments.map((fc, idx) => (
              <div key={idx} className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {fc.friendName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{fc.friendName}</span>
                  <span className="text-xs text-pink-600">ordered {fc.orderCount}x</span>
                </div>
                {fc.comment && (
                  <p className="text-sm text-gray-700 italic ml-8">"{fc.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Your Comment */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-900 mb-3">Leave a note for friends</h3>
        <p className="text-xs text-gray-500 mb-3">Your friends will see this when they view this product</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g., Best chai with this milk!"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />
          <button
            onClick={handleAddComment}
            disabled={!comment.trim()}
            className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Post
          </button>
        </div>
        {commentSaved && (
          <p className="text-green-600 text-xs mt-2">✓ Comment saved! Your friends will see it.</p>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
