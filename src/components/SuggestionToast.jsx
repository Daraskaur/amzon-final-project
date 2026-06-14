import { useCart } from '../context/CartContext';

function SuggestionToast() {
  const { suggestion, dismissSuggestion, addToCart } = useCart();

  if (!suggestion) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 max-w-sm animate-slide-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <p className="text-sm font-medium text-gray-900">Frequently bought together</p>
        </div>
        <button onClick={dismissSuggestion} className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        People who bought <span className="font-medium">{suggestion.trigger}</span> also added:
      </p>
      <div className="space-y-2">
        {suggestion.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
            <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">
                ₹{item.deal ? item.dealPrice : item.price}
              </p>
            </div>
            <button
              onClick={() => {
                addToCart(item);
                dismissSuggestion();
              }}
              className="text-xs bg-amazon-orange text-white px-2.5 py-1 rounded-md hover:bg-amazon-orange-hover flex-shrink-0 font-medium"
            >
              + Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestionToast;
