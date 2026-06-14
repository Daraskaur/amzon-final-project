import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import SmartCart from '../components/SmartCart';
import CrossSuggestBanner from '../components/CrossSuggestBanner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import products from '../data/products.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const categories = [
  'All',
  'Fresh Fruits',
  'Fresh Vegetables',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry Staples',
  'Beverages',
  'Snacks',
  'Frozen',
  'Health & Fitness',
];

function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showDeals, setShowDeals] = useState(false);
  const [showSmartCart, setShowSmartCart] = useState(false);
  const [friendFavorites, setFriendFavorites] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/api/friends/recommendations/${user.phone}`)
        .then(r => r.json())
        .then(data => setFriendFavorites(data.recommendations || []))
        .catch(() => {});
    }
  }, [user]);

  const getFilteredProducts = () => {
    if (showDeals) {
      return products.filter((p) => p.deal);
    }
    if (activeCategory !== 'All') {
      return products.filter((p) => p.category === activeCategory);
    }
    return products;
  };

  const filteredProducts = getFilteredProducts();
  const dealProducts = products.filter((p) => p.deal);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setShowDeals(false);
  };

  const handleDealsClick = () => {
    setShowDeals(true);
    setActiveCategory('All');
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded">NEW</span>
                <span className="text-sm text-green-200">10-30 min delivery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                Groceries delivered in minutes
              </h1>
              <p className="text-base text-green-100 mb-5">
                Fresh fruits, veggies, dairy, meat, snacks & more — at your door before you know it.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-block bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-2.5 px-5 rounded-md text-sm transition-colors"
                >
                  Shop Now
                </a>
                <button
                  onClick={() => setShowSmartCart(true)}
                  className="inline-flex items-center gap-2 bg-white text-green-700 font-bold py-2.5 px-5 rounded-md text-sm hover:bg-gray-100 transition-colors"
                >
                  ⚡ Smart Cart
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&h=350&fit=crop"
                alt="Fresh groceries"
                className="rounded-lg shadow-lg max-h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Banners */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <div>
              <p className="font-bold text-gray-900 text-xs">10-min Delivery</p>
              <p className="text-xs text-gray-500">Instant essentials</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold text-gray-900 text-xs">100% Fresh</p>
              <p className="text-xs text-gray-500">Quality assured</p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-bold text-gray-900 text-xs">Best Prices</p>
              <p className="text-xs text-gray-500">Save up to 40%</p>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <p className="font-bold text-gray-900 text-xs">Smart Cart</p>
              <p className="text-xs text-gray-500">Auto-fill by occasion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Platform Suggestions (shows after All Categories purchase) */}
      <CrossSuggestBanner />

      {/* Today's Deals Carousel */}
      {!showDeals && dealProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🔥 Today's Deals
              </h2>
              <button
                onClick={handleDealsClick}
                className="text-sm text-amazon-orange hover:underline font-medium"
              >
                See all →
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {dealProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-36 text-center bg-white rounded-lg p-2 border border-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded-lg mb-1.5"
                  />
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-xs text-red-600 font-bold">{'\u20B9'}{product.dealPrice}</span>
                    <span className="text-xs text-gray-400 line-through">{'\u20B9'}{product.price}</span>
                  </div>
                  <span className="inline-block mt-0.5 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                    {Math.round(((product.price - product.dealPrice) / product.price) * 100)}% OFF
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-1.5 bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-1 rounded text-xs transition-colors"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Friends' Favorites Section */}
      {friendFavorites.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              ❤️ Popular with Friends
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {friendFavorites.map((fav, idx) => {
                const product = products.find(p => p.id === fav.productId);
                if (!product) return null;
                return (
                  <div key={idx} className="flex-shrink-0 w-40 bg-pink-50 border border-pink-200 rounded-lg p-3">
                    <img src={product.image} alt={product.name} className="w-full h-20 object-cover rounded mb-2" />
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-pink-600 mt-0.5">
                      ❤️ {fav.friendName} ordered {fav.orderCount}x
                    </p>
                    {fav.comment && (
                      <p className="text-xs text-gray-500 italic mt-0.5 line-clamp-1">"{fav.comment}"</p>
                    )}
                    <p className="text-xs font-bold text-gray-900 mt-1">{'\u20B9'}{product.deal ? product.dealPrice : product.price}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full mt-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold py-1 rounded text-xs transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 pb-8">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          <button
            onClick={handleDealsClick}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showDeals
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600'
            }`}
          >
            🔥 Deals
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === category && !showDeals
                  ? 'bg-amazon-orange text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-amazon-orange hover:text-amazon-orange'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            {showDeals ? "🔥 Today's Deals" : activeCategory === 'All' ? 'All Products' : activeCategory}
          </h2>
          <p className="text-xs text-gray-500">
            {filteredProducts.length} item{filteredProducts.length !== 1 && 's'}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Smart Cart Button */}
      <button
        onClick={() => setShowSmartCart(true)}
        className="fixed bottom-6 right-6 bg-amazon-orange hover:bg-amazon-orange-hover text-white p-4 rounded-full shadow-lg z-40"
        title="Smart Cart"
      >
        <span className="text-lg">⚡</span>
      </button>

      {/* Smart Cart Modal */}
      {showSmartCart && <SmartCart onClose={() => setShowSmartCart(false)} />}
    </div>
  );
}

export default Home;
