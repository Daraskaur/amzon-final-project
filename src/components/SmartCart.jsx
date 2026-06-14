import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getSmartCartRecommendations, getAvailableOccasions } from '../utils/smartCart';

function SmartCart({ onClose }) {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState('');
  const [snackMode, setSnackMode] = useState('mix'); // healthy, junk, mix
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [recommendations, setRecommendations] = useState(null);
  const [addedAll, setAddedAll] = useState(false);

  const occasions = getAvailableOccasions();

  const isSnackOccasion = () => {
    const q = occasion.toLowerCase();
    return q.includes('snack') || q.includes('movie') || q.includes('party') || q.includes('munch');
  };

  const handleGenerate = () => {
    const result = getSmartCartRecommendations(occasion, {
      budget: budget ? parseFloat(budget) : null,
      people,
      urgency,
      snackMode: isSnackOccasion() ? snackMode : 'mix',
    });
    setRecommendations(result);
    setStep(6);
  };

  const handleAddAll = () => {
    if (recommendations) {
      recommendations.items.forEach(({ product, quantity }) => {
        addToCart(product, quantity);
      });
      setAddedAll(true);
    }
  };

  const handleAddSingle = (product, quantity) => {
    addToCart(product, quantity);
  };

  const handleSkip = () => {
    if (step === 2) {
      setSnackMode('mix');
      setStep(3);
    } else if (step === 3) {
      setPeople(2);
      setStep(4);
    } else if (step === 4) {
      setBudget('');
      setStep(5);
    } else if (step === 5) {
      setUrgency('medium');
      handleGenerate();
    }
  };

  const totalSteps = isSnackOccasion() ? 5 : 4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amazon-orange to-yellow-500 p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">&#9889;</span>
            <h2 className="text-lg font-bold text-white">Smart Cart</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Occasion */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">What are you planning?</h3>
              <p className="text-sm text-gray-500 mb-4">Type or pick an occasion</p>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g., Movie Night, Breakfast, Party, Snacks..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange mb-4"
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {occasions.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccasion(occ)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      occasion.toLowerCase() === occ
                        ? 'bg-amazon-orange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {occ.charAt(0).toUpperCase() + occ.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!occasion.trim()) return;
                  if (isSnackOccasion()) setStep(2);
                  else setStep(3);
                }}
                disabled={!occasion.trim()}
                className="w-full bg-amazon-orange hover:bg-amazon-orange-hover disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 2: Snack Mode (only for snack occasions) */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">What kind of snacks?</h3>
              <p className="text-sm text-gray-500 mb-4">Pick your vibe</p>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'healthy', label: 'Healthy', desc: 'Nuts, fruits, yogurt, granola', icon: '🥗' },
                  { value: 'junk', label: 'Junk / Indulgent', desc: 'Chips, chocolate, ice cream, cola', icon: '🍕' },
                  { value: 'mix', label: 'Mix of Both', desc: 'A little bit of everything', icon: '🎉' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSnackMode(opt.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      snackMode === opt.value
                        ? 'border-amazon-orange bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 rounded-lg transition-colors">Next</button>
              </div>
            </div>
          )}

          {/* Step 3: Number of People */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">How many people?</h3>
              <p className="text-sm text-gray-500 mb-4">We'll adjust quantities accordingly</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setPeople(Math.max(1, people - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold"
                >
                  &minus;
                </button>
                <span className="text-4xl font-bold text-amazon-orange w-16 text-center">{people}</span>
                <button
                  onClick={() => setPeople(Math.min(20, people + 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSkip} className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50">Skip</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 rounded-lg transition-colors">Next</button>
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">What's your budget?</h3>
              <p className="text-sm text-gray-500 mb-4">We'll keep it within this amount</p>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{'\u20B9'}</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., 200, 500, 1000"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {[200, 500, 1000, 1500, 2000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBudget(amt.toString())}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                      budget === amt.toString()
                        ? 'bg-amazon-orange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {'\u20B9'}{amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSkip} className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50">Skip (No limit)</button>
                <button onClick={() => setStep(5)} className="flex-1 bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 rounded-lg transition-colors">Next</button>
              </div>
            </div>
          )}

          {/* Step 5: Urgency */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">How urgent?</h3>
              <p className="text-sm text-gray-500 mb-4">High urgency = we prioritize deals</p>
              <div className="space-y-3 mb-6">
                {[
                  { value: 'low', label: 'No rush', desc: 'Planning ahead', icon: '🕐' },
                  { value: 'medium', label: 'Normal', desc: '30-min delivery', icon: '📦' },
                  { value: 'high', label: 'Urgent', desc: '10-min delivery', icon: '⚡' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setUrgency(opt.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      urgency === opt.value ? 'border-amazon-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSkip} className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50">Skip</button>
                <button onClick={handleGenerate} className="flex-1 bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 rounded-lg transition-colors">Generate Cart</button>
              </div>
            </div>
          )}

          {/* Step 6: Results */}
          {step === 6 && (
            <div>
              {recommendations ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Your {recommendations.occasion.charAt(0).toUpperCase() + recommendations.occasion.slice(1)} Cart
                    </h3>
                    <p className="text-sm text-gray-500">{recommendations.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {people} {people === 1 ? 'person' : 'people'}
                      {isSnackOccasion() && <span> &bull; Mode: {snackMode}</span>}
                      {budget && <span> &bull; Budget: {'\u20B9'}{budget}</span>}
                    </p>
                  </div>

                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {recommendations.items.map(({ product, quantity }) => (
                      <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            Qty: {quantity} &bull; {'\u20B9'}{((product.deal ? product.dealPrice : product.price) * quantity)}
                            {product.deal && <span className="ml-1 text-red-600 font-medium">DEAL</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddSingle(product, quantity)}
                          className="text-xs bg-amazon-orange text-white px-2 py-1 rounded hover:bg-amazon-orange-hover flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-amazon-orange">{'\u20B9'}{recommendations.totalCost}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Delivers in 10-30 minutes</p>
                  </div>

                  {addedAll ? (
                    <div className="w-full bg-green-600 text-white font-bold py-3 rounded-lg text-center flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All items added to cart!
                    </div>
                  ) : (
                    <button onClick={handleAddAll} className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 rounded-lg transition-colors">
                      Add All to Cart
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Couldn't find items for "{occasion}".</p>
                  <p className="text-sm text-gray-400 mb-4">Try: movie night, breakfast, dinner, party, snack, healthy, bbq</p>
                  <button onClick={() => { setStep(1); setOccasion(''); }} className="bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-2 px-6 rounded-lg">Try Again</button>
                </div>
              )}
            </div>
          )}

          {/* Progress dots */}
          {step < 6 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: isSnackOccasion() ? 5 : 4 }, (_, i) => i + 1).map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === step ? 'bg-amazon-orange' : s < step ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SmartCart;
