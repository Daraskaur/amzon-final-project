import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function CrossSuggestBanner() {
  const { addToCart } = useCart();
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchaseName, setPurchaseName] = useState('');

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('freshcart-allcategory-purchases') || '[]');
    if (history.length === 0) return;

    const recent = history[history.length - 1];
    setPurchaseName(recent.name);

    setLoading(true);
    fetch(`${API_BASE}/api/cross-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchQuery: 'accessories and quick delivery essentials',
        purchaseHistory: [recent],
      }),
    })
      .then(r => r.json())
      .then(data => {
        setSuggestions(data.suggestions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (dismissed || (!loading && suggestions.length === 0)) return null;

  const handleAdd = (suggestion) => {
    addToCart({
      id: Date.now() + Math.random(),
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
    <div className="max-w-7xl mx-auto px-4 pb-4">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">Recently bought: {purchaseName}</p>
            <p className="text-xs text-indigo-600">Quick-delivery items you might need — 10 min delivery</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 animate-pulse">AI finding compatible items...</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {suggestions.map((s, idx) => (
              <div key={idx} className="flex-shrink-0 w-44 bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-medium text-gray-900 line-clamp-2">{s.name}</p>
                <p className="text-xs text-indigo-600 mt-1">{s.tag}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.reason}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{'\u20B9'}{s.price}</p>
                <button
                  onClick={() => handleAdd(s)}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded text-xs transition-colors"
                >
                  + Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CrossSuggestBanner;
