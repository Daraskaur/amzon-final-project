import { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart-user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart-location');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [preferences, setPreferencesState] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart-preferences');
      return saved ? JSON.parse(saved) : { allergies: [], dietaryPrefs: [] };
    } catch { return { allergies: [], dietaryPrefs: [] }; }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('freshcart-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('freshcart-user');
    }
  }, [user]);

  useEffect(() => {
    if (location) {
      localStorage.setItem('freshcart-location', JSON.stringify(location));
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem('freshcart-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const setPreferences = (newPreferences) => {
    setPreferencesState(newPreferences);
  };

  const requestLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocation({ city: 'Mumbai', area: 'Your Area', lat: 19.076, lng: 72.877 });
        resolve();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using free API
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state_district || 'Your City';
            const area = data.address?.suburb || data.address?.neighbourhood || data.address?.road || '';
            setLocation({ city, area, lat: latitude, lng: longitude });
          } catch {
            setLocation({ city: 'Your City', area: '', lat: latitude, lng: longitude });
          }
          resolve();
        },
        () => {
          // Permission denied — use default
          setLocation({ city: 'Mumbai', area: 'Location unavailable', lat: 19.076, lng: 72.877 });
          resolve();
        }
      );
    });
  };

  const login = async (phone, name) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      const localUser = { phone, name, createdAt: Date.now() };
      setUser(localUser);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setLocation(null);
    localStorage.removeItem('freshcart-user');
    localStorage.removeItem('freshcart-location');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, location, requestLocation, preferences, setPreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
