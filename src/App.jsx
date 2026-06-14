import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SuggestionToast from './components/SuggestionToast';
import ElderNotification from './components/ElderNotification';
import AllergyWarning from './components/AllergyWarning';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Elder from './pages/Elder';
import Login from './pages/Login';
import Friends from './pages/Friends';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Preferences from './pages/Preferences';
import AllCategories from './pages/AllCategories';
import { useAuth } from './context/AuthContext';

function App() {
  const location = useLocation();
  const { user } = useAuth();
  const isElderMode = location.pathname === '/elder';
  const isLoginPage = location.pathname === '/login';

  if (isElderMode) {
    return <Elder />;
  }

  if (isLoginPage || !user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ElderNotification />
      <AllergyWarning />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/all-categories" element={<AllCategories />} />
        </Routes>
      </main>
      <SuggestionToast />
      <footer className="bg-amazon-light-navy text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="font-bold mb-2 text-sm">Get to Know Us</h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Careers</li>
                <li className="hover:text-white cursor-pointer">Press</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-sm">Shop With Us</h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="hover:text-white cursor-pointer">Your Account</li>
                <li className="hover:text-white cursor-pointer">Your Orders</li>
                <li className="hover:text-white cursor-pointer">Fitness Plan</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-sm">Help</h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="hover:text-white cursor-pointer">Delivery Info</li>
                <li className="hover:text-white cursor-pointer">Returns</li>
                <li className="hover:text-white cursor-pointer">Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-sm">Features</h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li className="hover:text-white cursor-pointer">Smart Cart</li>
                <li className="hover:text-white cursor-pointer">Today's Deals</li>
                <li className="hover:text-white cursor-pointer">Quick Delivery</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-4 text-center text-xs text-gray-400">
            <p>© 2026 FreshCart — 10-min Grocery Delivery | Hackathon Prototype</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
