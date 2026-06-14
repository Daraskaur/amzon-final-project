import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const INR = '\u20B9';

function Cart() {
  const {
    cartItems, removeFromCart, updateQuantity, getCartCount, confirmElderItem,
    splitPeople, splitEnabled, setSplitEnabled, addPerson, removePerson, assignItem, getSplitTotals,
  } = useCart();
  const navigate = useNavigate();
  const [newPersonName, setNewPersonName] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-lg mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any groceries yet.</p>
          <Link
            to="/"
            className="inline-block bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 px-8 rounded-md transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const getItemPrice = (item) => item.deal ? item.dealPrice : item.price;

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity, 0
  );

  const savings = cartItems.reduce(
    (sum, item) => sum + (item.deal ? (item.price - item.dealPrice) * item.quantity : 0), 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {/* Split Cart Toggle & Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span className="font-semibold text-gray-900">Split Cart</span>
            <span className="text-xs text-gray-500">— divide items among people</span>
          </div>
          <button
            onClick={() => setSplitEnabled(!splitEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${splitEnabled ? 'bg-amazon-orange' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${splitEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {splitEnabled && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Add person */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPersonName.trim()) {
                    addPerson(newPersonName);
                    setNewPersonName('');
                  }
                }}
                placeholder="Add a person (e.g. Roommate 1)"
                className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
              />
              <button
                onClick={() => {
                  if (newPersonName.trim()) {
                    addPerson(newPersonName);
                    setNewPersonName('');
                  }
                }}
                className="bg-amazon-orange text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                Add
              </button>
            </div>

            {/* People tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {splitPeople.map((person) => (
                <span
                  key={person}
                  className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-2.5 py-1 rounded-full"
                >
                  {person}
                  {person !== 'Me' && (
                    <button
                      onClick={() => removePerson(person)}
                      className="ml-0.5 text-amber-600 hover:text-red-600 font-bold text-xs"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Per-person totals */}
            {splitPeople.length > 1 && (
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Split Summary</p>
                <div className="space-y-1.5">
                  {Object.entries(getSplitTotals()).map(([person, amount]) => (
                    <div key={person} className="flex justify-between text-sm">
                      <span className="text-gray-700">{person}</span>
                      <span className="font-semibold text-gray-900">{INR}{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className={`bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 ${item.elderRequest ? 'border-2 border-dashed border-purple-400' : ''}`}>
              {item.elderRequest && (
                <div className="absolute -top-2 left-4 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  📌 {item.requestedBy} asked for this
                </div>
              )}
              <Link to={item.elderRequest ? '#' : `/product/${item.id}`} className="flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full sm:w-24 h-24 object-cover rounded" />
              </Link>
              <div className="flex-1 flex flex-col">
                <span className="text-base font-medium text-gray-900">
                  {item.name}
                </span>
                {item.elderRequest && (
                  <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded w-fit font-medium">
                    📌 {item.requestedBy} asked for this ({item.historyNote})
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-0.5">{item.category}</p>
                {item.deal && (
                  <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded w-fit font-medium">DEAL</span>
                )}
                <p className="text-green-700 text-xs mt-1">In Stock &bull; 10-min delivery</p>
                {/* Split Cart: person assignment dropdown */}
                {splitEnabled && splitPeople.length > 1 && (
                  <div className="mt-2">
                    <select
                      value={item.assignedTo || 'shared'}
                      onChange={(e) => assignItem(item.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                    >
                      <option value="shared">🔀 Shared (split equally)</option>
                      {splitPeople.map((person) => (
                        <option key={person} value={person}>👤 {person}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-auto pt-2">
                  {item.elderRequest ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => confirmElderItem(item.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-green-700 transition-colors"
                      >
                        ✓ Confirm
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-red-200 transition-colors"
                      >
                        ✗ Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors text-sm"
                        >
                          &minus;
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300 min-w-[2rem] text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600 hover:text-red-800 hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right sm:text-left flex-shrink-0">
                <p className="text-lg font-bold text-gray-900">
                  {INR}{getItemPrice(item) * item.quantity}
                </p>
                {item.deal && (
                  <p className="text-xs text-red-600">
                    Save {INR}{(item.price - item.dealPrice) * item.quantity}
                  </p>
                )}
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-500">
                    {INR}{getItemPrice(item)} each
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-16">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* Discount Progress Bar */}
            {(() => {
              const FREE_DELIVERY = 199;
              const BULK_DISCOUNT = 499;
              const BULK_DISCOUNT_PERCENT = 10;
              const progress = Math.min(100, (cartTotal / BULK_DISCOUNT) * 100);
              const freeDeliveryUnlocked = cartTotal >= FREE_DELIVERY;
              const bulkUnlocked = cartTotal >= BULK_DISCOUNT;
              const remaining = BULK_DISCOUNT - cartTotal;

              return (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  {/* Progress bar */}
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${bulkUnlocked ? 'bg-green-500' : 'bg-amazon-orange'}`}
                      style={{ width: `${progress}%` }}
                    />
                    {/* Free delivery marker */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-green-600"
                      style={{ left: `${(FREE_DELIVERY / BULK_DISCOUNT) * 100}%` }}
                    />
                  </div>

                  {/* Milestones */}
                  <div className="flex justify-between text-xs mb-2">
                    <span className={freeDeliveryUnlocked ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {freeDeliveryUnlocked ? '✓ ' : ''}{INR}{FREE_DELIVERY}
                    </span>
                    <span className={bulkUnlocked ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {bulkUnlocked ? '✓ ' : ''}{INR}{BULK_DISCOUNT}
                    </span>
                  </div>

                  {/* Status message */}
                  {bulkUnlocked ? (
                    <p className="text-xs text-green-700 font-medium">
                      🎉 {BULK_DISCOUNT_PERCENT}% bulk discount unlocked! Free delivery included.
                    </p>
                  ) : freeDeliveryUnlocked ? (
                    <p className="text-xs text-green-700">
                      ✓ Free delivery unlocked! Add {INR}{remaining} more for {BULK_DISCOUNT_PERCENT}% bulk discount.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Add {INR}{FREE_DELIVERY - cartTotal} more for free delivery, {INR}{remaining} for {BULK_DISCOUNT_PERCENT}% off.
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items ({getCartCount()}):</span>
                <span>{INR}{cartTotal}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">You save:</span>
                  <span className="text-green-700 font-medium">&minus; {INR}{savings}</span>
                </div>
              )}
              {cartTotal >= 499 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Bulk discount (10%):</span>
                  <span className="text-green-700 font-medium">&minus; {INR}{Math.round(cartTotal * 0.1)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery:</span>
                <span className={`font-medium ${cartTotal >= 199 ? 'text-green-700' : 'text-gray-700'}`}>
                  {cartTotal >= 199 ? 'FREE' : `${INR}30`}
                </span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold text-amazon-orange">
                  {INR}{cartTotal >= 499 ? Math.round(cartTotal * 0.9) : cartTotal + (cartTotal < 199 ? 30 : 0)}
                </span>
              </div>
              {cartTotal >= 499 && (
                <p className="text-xs text-green-600 mt-1">You saved {INR}{Math.round(cartTotal * 0.1)} with bulk discount!</p>
              )}
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold py-3 px-6 rounded-full transition-colors">
              Proceed to Checkout
            </button>
            <Link to="/" className="block text-center mt-4 text-sm text-amazon-orange hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
