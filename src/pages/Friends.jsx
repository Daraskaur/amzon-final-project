import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendPhone, setFriendPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/friends/${user.phone}`);
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      console.log('Server unavailable');
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!friendPhone) { setError('Enter a phone number'); return; }
    if (friendPhone === user.phone) { setError("That's your own number!"); return; }

    try {
      const res = await fetch(`${API_BASE}/api/friends/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myPhone: user.phone, friendPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Added ${data.friend?.name || friendPhone} as friend!`);
        setFriendPhone('');
        fetchFriends();
      } else {
        setError(data.error || 'Could not add friend');
      }
    } catch (err) {
      setError('Server not available');
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Please login first</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Friends</h1>
      <p className="text-gray-500 text-sm mb-6">Add friends to see their favorite products with reviews</p>

      {/* Add Friend */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Add a Friend</h2>
        <form onSubmit={handleAddFriend} className="flex gap-3">
          <input
            type="tel"
            value={friendPhone}
            onChange={(e) => setFriendPhone(e.target.value)}
            placeholder="Friend's phone number"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />
          <button
            type="submit"
            className="bg-amazon-orange hover:bg-amazon-orange-hover text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </form>
        {message && <p className="text-green-600 text-xs mt-2">{message}</p>}
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {/* Your Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-bold">Your number:</span> {user.phone} — share this with friends so they can add you
        </p>
      </div>

      {/* Friends List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="font-bold text-gray-900 mb-3">Your Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-gray-400 text-sm">No friends added yet. Add someone above!</p>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.phone} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-10 h-10 bg-amazon-orange rounded-full flex items-center justify-center text-white font-bold">
                  {friend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{friend.name}</p>
                  <p className="text-xs text-gray-500">{friend.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
