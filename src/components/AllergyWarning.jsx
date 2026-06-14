import { useCart } from '../context/CartContext';

function AllergyWarning() {
  const { allergyWarning, confirmAllergyWarning, dismissAllergyWarning } = useCart();

  if (!allergyWarning) return null;

  const { product, matchedAllergens } = allergyWarning;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-bounce-in">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
          <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <span className="text-2xl">⚠️</span> Allergy Alert!
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Product info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
            <div>
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500">{product.category}</p>
            </div>
          </div>

          {/* Warning message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">
              This product contains{' '}
              <span className="font-bold">
                {matchedAllergens.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
              </span>{' '}
              which you{'\u2019'}re allergic to.
            </p>
          </div>

          {/* Allergen badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {matchedAllergens.map((allergen) => (
              <span
                key={allergen}
                className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full capitalize"
              >
                {allergen}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={dismissAllergyWarning}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Don{'\u2019'}t Add
            </button>
            <button
              onClick={confirmAllergyWarning}
              className="flex-1 px-4 py-2.5 bg-amazon-orange text-white font-medium rounded-lg hover:bg-amazon-orange-hover transition-colors"
            >
              Add Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllergyWarning;
