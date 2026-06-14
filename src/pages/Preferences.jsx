import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ALLERGY_OPTIONS = ['gluten', 'lactose', 'nuts', 'egg', 'soy', 'shellfish', 'peanuts'];
const DIETARY_OPTIONS = ['vegetarian', 'vegan', 'jain'];

function Preferences() {
  const { preferences, setPreferences } = useAuth();
  const [allergies, setAllergies] = useState(preferences.allergies || []);
  const [dietaryPrefs, setDietaryPrefs] = useState(preferences.dietaryPrefs || []);
  const [customAllergy, setCustomAllergy] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleAllergy = (allergy) => {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
    setSaved(false);
  };

  const toggleDietaryPref = (pref) => {
    setDietaryPrefs((prev) =>
      prev.includes(pref)
        ? prev.filter((p) => p !== pref)
        : [...prev, pref]
    );
    setSaved(false);
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim().toLowerCase();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies((prev) => [...prev, trimmed]);
      setCustomAllergy('');
      setSaved(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomAllergy();
    }
  };

  const removeAllergy = (allergy) => {
    setAllergies((prev) => prev.filter((a) => a !== allergy));
    setSaved(false);
  };

  const handleSave = () => {
    setPreferences({ allergies, dietaryPrefs });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-amazon-orange hover:underline text-sm">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Allergy & Dietary Preferences</h1>
      <p className="text-gray-600 mb-8">
        Set your preferences so we can warn you about products that may not be suitable for you.
      </p>

      {/* Allergies Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Allergies</h2>
        <p className="text-sm text-gray-500 mb-4">Select any allergens you want to be warned about.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {ALLERGY_OPTIONS.map((allergy) => (
            <button
              key={allergy}
              onClick={() => toggleAllergy(allergy)}
              className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                allergies.includes(allergy)
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>

        {/* Custom allergies */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a custom allergy..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
          />
          <button
            onClick={addCustomAllergy}
            disabled={!customAllergy.trim()}
            className="px-4 py-2 bg-amazon-orange text-white rounded-lg text-sm font-medium hover:bg-amazon-orange-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>

        {/* Show custom allergies (ones not in predefined list) */}
        {allergies.filter((a) => !ALLERGY_OPTIONS.includes(a)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {allergies
              .filter((a) => !ALLERGY_OPTIONS.includes(a))
              .map((allergy) => (
                <span
                  key={allergy}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm capitalize"
                >
                  {allergy}
                  <button
                    onClick={() => removeAllergy(allergy)}
                    className="ml-1 text-red-400 hover:text-red-600"
                    aria-label={`Remove ${allergy}`}
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </section>

      {/* Dietary Preferences Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Dietary Preferences</h2>
        <p className="text-sm text-gray-500 mb-4">Select your dietary preferences.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DIETARY_OPTIONS.map((pref) => (
            <button
              key={pref}
              onClick={() => toggleDietaryPref(pref)}
              className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                dietaryPrefs.includes(pref)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-amazon-orange text-white font-semibold rounded-lg hover:bg-amazon-orange-hover transition-colors shadow-md"
        >
          Save Preferences
        </button>
        {saved && (
          <span className="text-green-600 font-medium text-sm animate-pulse">
            ✓ Preferences saved!
          </span>
        )}
      </div>

      {/* Summary */}
      {(allergies.length > 0 || dietaryPrefs.length > 0) && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Preferences Summary</h3>
          {allergies.length > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-red-600">Allergies:</span>{' '}
              {allergies.map((a) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
            </p>
          )}
          {dietaryPrefs.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium text-green-600">Dietary:</span>{' '}
              {dietaryPrefs.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Preferences;
