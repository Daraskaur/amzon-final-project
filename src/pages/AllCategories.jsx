import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import allProducts from '../data/allCategoryProducts.json';
import StarRating from '../components/StarRating';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const INR = '\u20B9';

function AllCategories() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [purchased, setPurchased] = useState({});

  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProducts;

  const handleBuy = async (product) => {
    // Record this purchase on the server
    try {
      await fetch(`${API_BASE}/api/orders/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user?.phone || 'guest',
          productId: product.id,
          productName: product.name,
          isAllCategory: true,
          description: product.description,
        }),
      });
    } catch (err) {
      // Still mark as purchased locally
    }

    // Save to localStorage for cross-platform suggestions
    const history = JSON.parse(localStorage.getItem('freshcart-allcategory-purchases') || '[]');
    history.push({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      purchasedAt: Date.now(),
    });
    localStorage.setItem('freshcart-allcategory-purchases', JSON.stringify(history));

    setPurchased(prev => ({ ...prev, [product.id]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Categories</h1>
          <p className="text-sm text-gray-500">Electronics, appliances & more — standard delivery</p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Amazon All Categories</span>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search electronics, appliances, gadgets..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
            <StarRating rating={product.rating} />
            <p className="text-xl font-bold text-gray-900 mt-2">{INR}{product.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{product.category}</p>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
            <div className="mt-auto pt-3">
              {purchased[product.id] ? (
                <div className="w-full bg-green-600 text-white font-bold py-2 rounded-lg text-center text-xs flex items-center justify-center gap-1">
                  ✓ Purchased — delivers in 2-3 days
                </div>
              ) : (
                <button
                  onClick={() => handleBuy(product)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllCategories;
