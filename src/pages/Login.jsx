import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login, requestLocation } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: name
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit number'); return; }
    // Generate a random 4-digit OTP (simulated)
    const generated = String(Math.floor(1000 + Math.random() * 9000));
    setSentOtp(generated);
    setStep(2);
    setError('');
    // In a real app, this would send via SMS
    alert(`OTP sent! (Demo: your OTP is ${generated})`);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === sentOtp) {
      setStep(3);
      setError('');
    } else {
      setError('Incorrect OTP. Try again.');
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Enter your name'); return; }
    setLoading(true);
    const result = await login(phone, name);
    if (result.success) {
      await requestLocation();
      setLoading(false);
      navigate('/');
    } else {
      setLoading(false);
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amazon-navy to-amazon-light-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amazon-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="text-2xl font-bold text-gray-900">fresh<span className="text-amazon-orange">cart</span></span>
          </div>
          <p className="text-gray-500 text-sm">
            {step === 1 && 'Enter your phone number to get started'}
            {step === 2 && 'Enter the OTP sent to your phone'}
            {step === 3 && 'Almost done! What should we call you?'}
          </p>
        </div>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number</label>
              <div className="flex">
                <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2.5 text-sm text-gray-500">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full border border-gray-300 rounded-r-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                  maxLength={10}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 rounded-lg transition-colors"
            >
              Send OTP
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4-digit OTP"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-2">Sent to +91 {phone}</p>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 rounded-lg transition-colors"
            >
              Verify OTP
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700">
              ← Change number
            </button>
          </form>
        )}

        {/* Step 3: Name */}
        {step === 3 && (
          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Priya"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Start Shopping →'}
            </button>
          </form>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full ${s === step ? 'bg-amazon-orange' : s < step ? 'bg-green-500' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;
