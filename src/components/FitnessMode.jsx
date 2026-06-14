import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import products from '../data/products.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Protein-rich products to suggest
const PROTEIN_PRODUCT_IDS = [4, 5, 27, 28, 29, 30, 11, 26]; // eggs, chicken, paneer, whey, peanut butter, oats, yogurt, dal

function FitnessMode({ onClose }) {
  const { addToCart } = useCart();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [addedAll, setAddedAll] = useState(false);
  const [error, setError] = useState(null);
  const [useMock, setUseMock] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/fitness/status`);
      const data = await res.json();
      setConnected(data.connected);
      if (data.connected) {
        fetchWeeklySummary();
      } else {
        setLoading(false);
      }
    } catch (err) {
      // Server not running — offer mock mode
      setLoading(false);
      setUseMock(true);
    }
  };

  const connectGoogleFit = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`);
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      setError('Could not connect to server. Using demo mode.');
      loadMockData();
    }
  };

  const fetchWeeklySummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/fitness/weekly-summary`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary);
      setDailyBreakdown(data.dailyBreakdown);
      setConnected(true);
    } catch (err) {
      setError('Could not fetch fitness data. Using demo mode.');
      loadMockData();
    }
    setLoading(false);
  };

  const loadMockData = () => {
    // Simulate a week of active person data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockDaily = days.map((day, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
      dayName: day,
      calories: 250 + Math.floor(Math.random() * 300),
      activeMinutes: 20 + Math.floor(Math.random() * 40),
    }));

    const totalCalories = mockDaily.reduce((sum, d) => sum + d.calories, 0);
    const totalActiveMinutes = mockDaily.reduce((sum, d) => sum + d.activeMinutes, 0);
    const baseline = 2000;
    const excess = Math.max(0, totalCalories - baseline);
    const extraProtein = Math.round((excess / 200) * 10);

    setSummary({
      totalCaloriesBurned: totalCalories,
      totalActiveMinutes,
      baselineCalories: baseline,
      excessCalories: excess,
      extraProteinNeeded: extraProtein,
      dailyExtraProtein: Math.round(extraProtein / 7),
      isAboveThreshold: excess > 200,
    });
    setDailyBreakdown(mockDaily);
    setConnected(true);
    setUseMock(true);
    setLoading(false);
  };

  const disconnect = async () => {
    try {
      await fetch(`${API_BASE}/api/fitness/disconnect`, { method: 'POST' });
    } catch (err) {}
    setConnected(false);
    setSummary(null);
    setDailyBreakdown([]);
    setUseMock(false);
  };

  const getProteinProducts = () => {
    if (!summary) return [];
    const needed = summary.extraProteinNeeded;
    const items = PROTEIN_PRODUCT_IDS
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        product: p,
        quantity: 1,
        dailyProtein: p.protein,
      }));

    // Select enough items to cover the extra protein
    let total = 0;
    const selected = [];
    for (const item of items) {
      if (total >= needed) break;
      selected.push(item);
      total += item.dailyProtein * 7; // weekly contribution
    }
    return selected;
  };

  const handleAddAll = () => {
    const items = getProteinProducts();
    items.forEach(({ product, quantity }) => {
      addToCart(product, quantity);
    });
    setAddedAll(true);
  };

  const proteinItems = getProteinProducts();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to fitness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h2 className="text-lg font-bold text-white">Fitness Insights</h2>
            {useMock && <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded text-white">Demo</span>}
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Not connected state */}
          {!connected && (
            <div className="text-center py-4">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Connect Google Fit</h3>
              <p className="text-sm text-gray-500 mb-2">
                Link your Google Fit to get personalized protein recommendations based on your weekly activity.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                We'll track calories burned and suggest extra protein when you're more active than usual.
              </p>
              <button
                onClick={connectGoogleFit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Connect with Google Fit
              </button>
              <button
                onClick={loadMockData}
                className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Try Demo Mode (simulated data)
              </button>
            </div>
          )}

          {/* Connected state with data */}
          {connected && summary && (
            <>
              {/* Activity Alert Banner */}
              {summary.isAboveThreshold && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">You've been more active this week!</p>
                      <p className="text-xs text-gray-600 mt-1">
                        You burned <span className="font-bold text-orange-600">{summary.excessCalories} kcal</span> above your baseline.
                        Add <span className="font-bold text-green-700">{summary.extraProteinNeeded}g extra protein</span> ({summary.dailyExtraProtein}g/day) to support recovery.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-red-600">{summary.totalCaloriesBurned}</p>
                  <p className="text-xs text-gray-500">kcal burned</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-600">{summary.totalActiveMinutes}</p>
                  <p className="text-xs text-gray-500">active min</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-600">+{summary.extraProteinNeeded}g</p>
                  <p className="text-xs text-gray-500">protein needed</p>
                </div>
              </div>

              {/* Day-wise breakdown toggle */}
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-4 hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">📊 Day-wise Breakdown</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showBreakdown && (
                <div className="mb-4 space-y-2">
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {dailyBreakdown.map((day) => (
                      <div key={day.date} className="text-xs">
                        <p className="font-medium text-gray-700">{day.dayName}</p>
                        <div className="bg-gray-200 rounded-full h-16 relative mt-1 overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-300 rounded-full transition-all"
                            style={{ height: `${Math.min(100, (day.calories / 500) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs font-medium text-gray-900">{day.calories}</p>
                        <p className="text-gray-400" style={{ fontSize: '10px' }}>kcal</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-800 font-medium">Weekly protein plan:</p>
                    <p className="text-xs text-green-700 mt-1">
                      Need {summary.dailyExtraProtein}g extra protein per day × 7 days = {summary.extraProteinNeeded}g total
                    </p>
                  </div>
                </div>
              )}

              {/* Suggested Protein Items */}
              {summary.isAboveThreshold && (
                <>
                  <h4 className="font-bold text-gray-900 text-sm mb-3">
                    Suggested based on activity:
                  </h4>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {proteinItems.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2.5">
                        <img src={product.image} alt={product.name} className="w-11 h-11 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-700 font-medium">{product.protein}g protein</span>
                            <span className="text-xs text-gray-400">{'\u20B9'}{product.deal ? product.dealPrice : product.price}</span>
                          </div>
                          <span className="inline-block mt-0.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            Suggested based on activity
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700 flex-shrink-0 font-medium"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>

                  {addedAll ? (
                    <div className="w-full bg-green-600 text-white font-bold py-3 rounded-lg text-center flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Protein items added! Delivers in 10 min
                    </div>
                  ) : (
                    <button
                      onClick={handleAddAll}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      Add All Protein Items to Cart
                    </button>
                  )}
                </>
              )}

              {!summary.isAboveThreshold && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <span className="text-2xl">👍</span>
                  <p className="text-sm font-medium text-gray-900 mt-2">You're on track!</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your activity this week is normal. We'll alert you when you need extra protein.
                  </p>
                </div>
              )}

              {/* Disconnect option */}
              <button
                onClick={disconnect}
                className="w-full mt-4 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Disconnect fitness tracking
              </button>
            </>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FitnessMode;
