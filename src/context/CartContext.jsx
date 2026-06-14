import { createContext, useContext, useState, useEffect } from 'react';
import products from '../data/products.json';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { preferences } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart-items');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [suggestion, setSuggestion] = useState(null);
  const [allergyWarning, setAllergyWarning] = useState(null);

  // Split Cart state
  const [splitPeople, setSplitPeople] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart-split-people');
      return saved ? JSON.parse(saved) : ['Me'];
    } catch { return ['Me']; }
  });
  const [splitEnabled, setSplitEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart-split-enabled');
      return saved === 'true';
    } catch { return false; }
  });

  // Sync to localStorage on every change
  useEffect(() => {
    localStorage.setItem('freshcart-items', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist split state
  useEffect(() => {
    localStorage.setItem('freshcart-split-people', JSON.stringify(splitPeople));
  }, [splitPeople]);

  useEffect(() => {
    localStorage.setItem('freshcart-split-enabled', String(splitEnabled));
  }, [splitEnabled]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'freshcart-items') {
        try {
          setCartItems(JSON.parse(e.newValue) || []);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToCart = (product, quantity = 1) => {
    // Check for allergen matches
    const userAllergies = preferences?.allergies || [];
    const userDietary = preferences?.dietaryPrefs || [];
    const productAllergens = product.allergens || [];
    const productDietaryFlags = product.dietaryFlags || [];

    // Check allergens
    let matchedAllergens = [];
    if (userAllergies.length > 0 && productAllergens.length > 0) {
      matchedAllergens = productAllergens.filter((allergen) =>
        userAllergies.some((allergy) => allergy.toLowerCase() === allergen.toLowerCase())
      );
    }

    // Check dietary conflicts (e.g., user is vegan but product is non-vegan)
    let dietaryConflicts = [];
    if (userDietary.length > 0 && productDietaryFlags.length > 0) {
      userDietary.forEach((pref) => {
        const flag = `non-${pref}`;
        if (productDietaryFlags.includes(flag)) {
          dietaryConflicts.push(pref);
        }
      });
    }

    if (matchedAllergens.length > 0 || dietaryConflicts.length > 0) {
      const warnings = [
        ...matchedAllergens.map(a => `contains ${a}`),
        ...dietaryConflicts.map(d => `not ${d}`),
      ];
      setAllergyWarning({ product, matchedAllergens: warnings, quantity });
      return;
    }

    // No conflict, add directly
    performAddToCart(product, quantity);
  };

  const performAddToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    // Show pairing suggestion
    if (product.pairsWith && product.pairsWith.length > 0) {
      const paired = product.pairsWith
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean)
        .filter((p) => !cartItems.some((ci) => ci.id === p.id) && p.id !== product.id);

      if (paired.length > 0) {
        setSuggestion({
          trigger: product.name,
          items: paired.slice(0, 2),
        });
        // Auto-dismiss after 8 seconds
        setTimeout(() => setSuggestion(null), 8000);
      }
    }
  };

  const confirmAllergyWarning = () => {
    if (allergyWarning) {
      performAddToCart(allergyWarning.product, allergyWarning.quantity);
      setAllergyWarning(null);
    }
  };

  const dismissAllergyWarning = () => {
    setAllergyWarning(null);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const confirmElderItem = (productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, elderRequest: false, confirmed: true } : item
      )
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.deal ? item.dealPrice : item.price) * item.quantity,
      0
    );
  };

  const dismissSuggestion = () => {
    setSuggestion(null);
  };

  // Split Cart functions
  const addPerson = (name) => {
    const trimmed = name.trim();
    if (trimmed && !splitPeople.includes(trimmed)) {
      setSplitPeople((prev) => [...prev, trimmed]);
    }
  };

  const removePerson = (name) => {
    if (name === 'Me') return; // Can't remove yourself
    setSplitPeople((prev) => prev.filter((p) => p !== name));
    // Reassign items from removed person to 'shared'
    setCartItems((prev) =>
      prev.map((item) =>
        item.assignedTo === name ? { ...item, assignedTo: 'shared' } : item
      )
    );
  };

  const assignItem = (productId, personName) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, assignedTo: personName } : item
      )
    );
  };

  const getSplitTotals = () => {
    const getItemPrice = (item) => item.deal ? item.dealPrice : item.price;
    const totals = {};
    splitPeople.forEach((p) => { totals[p] = 0; });

    cartItems.forEach((item) => {
      const itemTotal = getItemPrice(item) * item.quantity;
      const assignment = item.assignedTo || 'shared';

      if (assignment === 'shared') {
        // Split equally among all people
        const perPerson = itemTotal / splitPeople.length;
        splitPeople.forEach((p) => { totals[p] += perPerson; });
      } else {
        // Assigned to one person
        if (totals[assignment] !== undefined) {
          totals[assignment] += itemTotal;
        } else {
          // Person was removed, treat as shared
          const perPerson = itemTotal / splitPeople.length;
          splitPeople.forEach((p) => { totals[p] += perPerson; });
        }
      }
    });

    // Round to 2 decimals
    Object.keys(totals).forEach((k) => { totals[k] = Math.round(totals[k] * 100) / 100; });
    return totals;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        confirmElderItem,
        updateQuantity,
        getCartCount,
        getCartTotal,
        suggestion,
        dismissSuggestion,
        allergyWarning,
        confirmAllergyWarning,
        dismissAllergyWarning,
        // Split Cart
        splitPeople,
        setSplitPeople,
        splitEnabled,
        setSplitEnabled,
        addPerson,
        removePerson,
        assignItem,
        getSplitTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
