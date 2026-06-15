import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import elderProducts from '../data/elderProducts.json';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PIPELINE_STEPS_VOICE = [
  { label: 'Transcribing voice...', icon: '🎙️' },
  { label: 'Understanding intent...', icon: '🧠' },
  { label: 'Matching with order history...', icon: '🔍' },
  { label: 'Found match!', icon: '✅' },
];

const PIPELINE_STEPS_PHOTO = [
  { label: 'Analyzing photo...', icon: '📷' },
  { label: 'Identifying product...', icon: '🧠' },
  { label: 'Matching with order history...', icon: '🔍' },
  { label: 'Found match!', icon: '✅' },
];

function Elder() {
  const { addToCart } = useCart();
  const [mode, setMode] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [inputType, setInputType] = useState('voice');
  const [transcript, setTranscript] = useState('');
  const [intent, setIntent] = useState('');
  const [sent, setSent] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Use browser's Web Speech API for real speech-to-text
  const startListening = () => {
    setInputType('voice');
    setMode('recording');
    setIsListening(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setMode('idle');
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let gotResult = false;

    recognition.onresult = (event) => {
      gotResult = true;
      const text = event.results[0][0].transcript;
      setIsListening(false);
      processText(text);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      setMode('idle');
    };

    recognition.onend = () => {
      if (!gotResult) {
        setIsListening(false);
        setMode('idle');
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handlePhotoCapture = () => {
    setInputType('photo');
    setMode('recording');
    setTimeout(() => {
      const text = prompt('Describe what you see in the photo (e.g., "empty shampoo bottle"):');
      if (text) {
        processText(text);
      } else {
        setMode('idle');
      }
    }, 500);
  };

  const processText = async (text) => {
    setTranscript(`"${text}"`);
    const steps = inputType === 'voice' ? PIPELINE_STEPS_VOICE : PIPELINE_STEPS_PHOTO;
    setMode('processing');
    setCurrentStep(0);
    setCompletedSteps([]);

    // Step 1: Transcribing (already done)
    setCurrentStep(0);
    await delay(800);
    setCompletedSteps([0]);

    // Step 2: Understanding intent — call OpenAI
    setCurrentStep(1);
    let product = null;
    let intentText = '';

    try {
      const res = await fetch(`${API_BASE}/api/elder/understand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      
      if (data.success && data.product) {
        product = elderProducts.find(p => p.id === data.product.id) || {
          ...data.product,
          image: `https://placehold.co/400x400/1E3A5F/FFFFFF?text=${encodeURIComponent(data.product.name)}`,
          rating: 4.5,
          category: 'Personal Care',
          description: data.product.name,
          requestedBy: 'Mom',
        };
        intentText = data.intent;
      } else {
        intentText = data.intent || 'could not understand';
      }
    } catch (err) {
      console.error('API error:', err.message);
      intentText = 'server unavailable';
    }

    setIntent(intentText);
    await delay(600);
    setCompletedSteps([0, 1]);

    // Step 3: Matching with history
    setCurrentStep(2);
    await delay(1000);
    setCompletedSteps([0, 1, 2]);

    // Step 4: Result
    setCurrentStep(3);
    await delay(600);
    setCompletedSteps([0, 1, 2, 3]);

    if (product) {
      setMatchedProduct(product);
      setMode('done');
      // Auto-add to cart immediately
      addToCart({
        ...product,
        elderRequest: true,
        tags: ['elder-request'],
        deal: false,
        protein: 0,
        servingSize: '',
        pairsWith: [],
      }, 1);
      setSent(true);
    } else {
      setMatchedProduct(null);
      setMode('notfound');
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSendToCart = () => {
    if (matchedProduct) {
      addToCart({
        ...matchedProduct,
        elderRequest: true,
        tags: ['elder-request'],
        deal: false,
        protein: 0,
        servingSize: '',
        pairsWith: [],
      }, 1);
      setSent(true);
    }
  };

  const handleReset = () => {
    setMode('idle');
    setCurrentStep(0);
    setCompletedSteps([]);
    setMatchedProduct(null);
    setTranscript('');
    setIntent('');
    setSent(false);
  };

  const steps = inputType === 'voice' ? PIPELINE_STEPS_VOICE : PIPELINE_STEPS_PHOTO;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: 'url(https://i.imgur.com/JxKzXpT.png)', backgroundSize: 'cover', backgroundColor: '#0b141a' }}>
      {/* WhatsApp-style header */}
      <div className="bg-[#1f2c34] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-lg overflow-hidden">
          <span>👩</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-base">Mom</p>
          <p className="text-xs text-green-400">online</p>
        </div>
        <div className="flex gap-4 text-gray-400">
          <span>📞</span>
          <span>📹</span>
          <span>⋮</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Idle — big buttons */}
        {mode === 'idle' && (
          <div className="text-center">
            <div className="bg-[#1f2c34] rounded-2xl p-6 max-w-xs mx-auto shadow-xl">
              <h1 className="text-white text-xl font-bold mb-1">Kya chahiye?</h1>
              <p className="text-gray-400 text-sm mb-8">Bolo ya photo bhejo</p>
              
              <div className="flex gap-6 justify-center">
                <button
                  onClick={startListening}
                  className="w-28 h-28 bg-[#00a884] hover:bg-[#02906f] rounded-full flex flex-col items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="text-4xl">🎤</span>
                  <span className="text-white text-xs font-medium">Bolo</span>
                </button>
                <button
                  onClick={handlePhotoCapture}
                  className="w-28 h-28 bg-[#2a3942] hover:bg-[#3a4952] border-2 border-[#00a884] rounded-full flex flex-col items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <span className="text-4xl">📷</span>
                  <span className="text-white text-xs font-medium">Photo</span>
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-xs mt-8 max-w-xs mx-auto">
              Amazon Family Assistant — speak in Hindi or English
            </p>
          </div>
        )}

        {/* Recording */}
        {mode === 'recording' && (
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="text-4xl">{inputType === 'voice' ? '🎙️' : '📸'}</span>
            </div>
            <p className="text-white text-lg font-medium">
              {inputType === 'voice' ? 'Listening...' : 'Capturing...'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {inputType === 'voice' ? 'Speak now — say what you need' : 'Analyzing image'}
            </p>
            {inputType === 'voice' && (
              <button
                onClick={stopListening}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95"
              >
                ⏹ Stop Recording
              </button>
            )}
            <div className="flex justify-center gap-1 mt-4">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-400 rounded-full animate-pulse"
                  style={{ height: `${15 + Math.random() * 35}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Processing pipeline */}
        {mode === 'processing' && (
          <div className="w-full max-w-sm">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <p className="text-green-400 text-sm font-mono mb-4 text-center">{transcript}</p>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      index <= currentStep ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      completedSteps.includes(index)
                        ? 'bg-green-600'
                        : index === currentStep
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-gray-700'
                    }`}>
                      {completedSteps.includes(index) ? '✓' : step.icon}
                    </div>
                    <span className={`text-sm ${
                      completedSteps.includes(index) ? 'text-green-400'
                        : index === currentStep ? 'text-yellow-400'
                        : 'text-gray-500'
                    }`}>
                      {index === 1 && intent && completedSteps.includes(1)
                        ? `Understanding intent: ${intent}`
                        : step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Done — matched product */}
        {mode === 'done' && matchedProduct && (
          <div className="w-full max-w-sm">
            <div className="bg-gray-800 rounded-xl p-6 border border-green-600">
              <div className="text-center mb-4">
                <span className="text-3xl">✅</span>
                <p className="text-green-400 font-bold mt-2">Match Found!</p>
                <p className="text-gray-400 text-xs mt-1">{transcript}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-4 mb-4">
                <img src={matchedProduct.image} alt={matchedProduct.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <p className="text-white font-medium text-sm">{matchedProduct.name}</p>
                  <p className="text-green-400 text-xs mt-1">{'\u20B9'}{matchedProduct.price}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{matchedProduct.historyNote}</p>
                </div>
              </div>

              <p className="text-gray-400 text-xs text-center mb-4">
                Intent: <span className="text-white">{intent}</span> → <span className="text-green-400">{matchedProduct.name}</span>
              </p>

              {sent ? (
                <div className="w-full bg-green-600 text-white font-bold py-3 rounded-lg text-center">
                  ✓ Added to cart — delivering in 10 min
                </div>
              ) : (
                <div className="w-full bg-green-600 text-white font-bold py-3 rounded-lg text-center animate-pulse">
                  Adding to cart...
                </div>
              )}

              <button onClick={handleReset} className="w-full mt-3 border border-gray-600 text-gray-400 font-medium py-2 rounded-lg hover:bg-gray-700 text-sm">
                Send another request
              </button>
            </div>
          </div>
        )}

        {/* Not found */}
        {mode === 'notfound' && (
          <div className="w-full max-w-sm">
            <div className="bg-gray-800 rounded-xl p-6 border border-red-600 text-center">
              <span className="text-3xl">❌</span>
              <p className="text-red-400 font-bold mt-2">Could not find a match</p>
              <p className="text-gray-400 text-xs mt-2">{transcript}</p>
              <p className="text-gray-500 text-xs mt-1">Try saying the product name more clearly</p>
              <button onClick={handleReset} className="mt-4 bg-gray-700 text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-600 text-sm">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom — WhatsApp input bar style */}
      <div className="bg-[#1f2c34] p-3 flex items-center gap-2">
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-gray-400 text-sm">
          Type a message...
        </div>
        <button onClick={startListening} className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🎤</span>
        </button>
      </div>
    </div>
  );
}

export default Elder;
