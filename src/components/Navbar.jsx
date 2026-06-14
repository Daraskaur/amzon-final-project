import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import products from '../data/products.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Navbar() {
  const { getCartCount, addToCart } = useCart();
  const { user, logout, location } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('now'); // 'now' or 'all'
  const [searchResults, setSearchResults] = useState([]);
  const [crossSuggestions, setCrossSuggestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length > 0 && searchMode === 'now') {
      const query = searchQuery.toLowerCase();
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.includes(query))
      );
      setSearchResults(results.slice(0, 6));
      setShowResults(true);

      // Check for cross-platform suggestions
      fetchCrossSuggestions(searchQuery);
    } else {
      setSearchResults([]);
      setCrossSuggestions([]);
      setShowResults(false);
    }
  }, [searchQuery, searchMode]);

  const fetchCrossSuggestions = async (query) => {
    const history = JSON.parse(localStorage.getItem('freshcart-allcategory-purchases') || '[]');
    if (history.length === 0) { setCrossSuggestions([]); return; }

    try {
      const res = await fetch(`${API_BASE}/api/cross-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: query, purchaseHistory: history }),
      });
      const data = await res.json();
      setCrossSuggestions(data.suggestions || []);
    } catch {
      setCrossSuggestions([]);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
        setShowModeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchMode === 'all') {
      navigate('/all-categories');
    }
    setShowResults(false);
  };

  const handleResultClick = (productId) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleAddCrossSuggestion = (suggestion) => {
    addToCart({
      id: Date.now(),
      name: suggestion.name,
      price: suggestion.price,
      image: `https://placehold.co/400x400/2C3E50/FFFFFF?text=${encodeURIComponent(suggestion.name.split(' ').slice(0, 2).join('+'))}`,
      rating: 4.5,
      category: 'Accessories',
      description: suggestion.reason,
      tags: [],
      deal: false,
      protein: 0,
      allergens: [],
      dietaryFlags: [],
      servingSize: '',
      pairsWith: [],
    }, 1);
  };

  return (
    <nav className="bg-amazon-navy text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 py-1 px-2 border border-transparent hover:border-white rounded">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amazon-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="text-xl font-bold">
              fresh<span className="text-amazon-orange">cart</span>
            </span>
          </div>
        </Link>

        {/* Delivery Location */}
        <div className="hidden lg:flex items-center gap-1 py-1 px-2 border border-transparent hover:border-white rounded cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <p className="text-xs text-gray-300">Deliver to</p>
            <p className="text-sm font-bold">{location?.city || 'Mumbai'}, India</p>
          </div>
        </div>

        {/* Search Bar with Mode Dropdown */}
        <div className="flex-1 relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex">
            {/* Mode Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="bg-gray-200 text-gray-800 px-3 py-2 rounded-l-md text-xs font-medium border-r border-gray-300 hover:bg-gray-300 whitespace-nowrap flex items-center gap-1"
              >
                {searchMode === 'now' ? 'Amazon Now' : 'All Categories'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showModeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-40">
                  <button
                type="button"
                onClick={() => { setSearchMode('now'); setShowModeDropdown(false); navigate('/'); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${searchMode === 'now' ? 'bg-orange-50 text-amazon-orange font-medium' : 'text-gray-700'}`}
              >
                Amazon Now
              </button>
              <button
                type="button"
                onClick={() => { setSearchMode('all'); setShowModeDropdown(false); navigate('/all-categories'); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${searchMode === 'all' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
              >
                All Categories
              </button>
                </div>
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowResults(true)}
              placeholder={searchMode === 'now' ? 'Search groceries, snacks...' : 'Search electronics, gadgets...'}
              className="w-full px-4 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            />
            <button
              type="submit"
              className="bg-amazon-orange hover:bg-amazon-orange-hover px-4 py-2 rounded-r-md"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchMode === 'now' && (searchResults.length > 0 || crossSuggestions.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              {/* AI Cross-Platform Suggestions */}
              {crossSuggestions.length > 0 && (
                <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-3">
                  <p className="text-xs text-indigo-600 font-medium mb-2 flex items-center gap-1">
                    ✨ Smart suggestion based on your purchases
                  </p>
                  {crossSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1.5 bg-white rounded-lg px-3 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{suggestion.name}</p>
                        <p className="text-xs text-indigo-600">{suggestion.tag}</p>
                        <p className="text-xs text-gray-500">{suggestion.reason}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold">{'\u20B9'}{suggestion.price}</p>
                        <button
                          onClick={() => handleAddCrossSuggestion(suggestion)}
                          className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded mt-0.5 hover:bg-indigo-700"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Regular results */}
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                >
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {product.deal ? (
                      <div>
                        <p className="text-sm font-bold text-red-600">{'\u20B9'}{product.dealPrice}</p>
                        <p className="text-xs text-gray-400 line-through">{'\u20B9'}{product.price}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-900">{'\u20B9'}{product.price}</p>
                    )}
                  </div>
                </button>
              ))}
              {searchResults.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                  {searchResults.length} result{searchResults.length !== 1 && 's'}
                </div>
              )}
            </div>
          )}

          {showResults && searchMode === 'now' && searchQuery.trim() && searchResults.length === 0 && crossSuggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 text-center">
              <p className="text-sm text-gray-500">No products found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Account / Logout */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 py-1 px-2 border border-transparent hover:border-white rounded cursor-pointer" onClick={logout}>
          <div>
            <p className="text-xs text-gray-300">Hello, {user?.name || 'Sign in'}</p>
            <p className="text-sm font-bold">Logout</p>
          </div>
        </div>

        {/* Preferences */}
        <Link to="/preferences" className="hidden md:block flex-shrink-0 py-1 px-2 border border-transparent hover:border-white rounded">
          <p className="text-xs text-gray-300">Allergy</p>
          <p className="text-sm font-bold">Prefs</p>
        </Link>

        {/* Friends */}
        <Link to="/friends" className="hidden md:block flex-shrink-0 py-1 px-2 border border-transparent hover:border-white rounded">
          <p className="text-xs text-gray-300">My</p>
          <p className="text-sm font-bold">Friends</p>
        </Link>

        {/* Orders */}
        <Link to="/orders" className="hidden lg:block flex-shrink-0 py-1 px-2 border border-transparent hover:border-white rounded">
          <p className="text-xs text-gray-300">Your</p>
          <p className="text-sm font-bold">Orders</p>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="flex items-center gap-1 py-1 px-2 border border-transparent hover:border-white rounded relative">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-amazon-orange text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-sm font-bold">Cart</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
