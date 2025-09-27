'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Match, useApp } from '@/lib/context';
import { MOCK_MATCHES } from '@/lib/mockData';

interface MatchesPageProps {}

export default function MatchesPage({}: MatchesPageProps) {
  const { navigateTo } = useApp();
  const [matches] = useState<Match[]>(MOCK_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedMatch) return;
    
    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date(),
      fromSelf: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Simulate reply after 2 seconds
    setTimeout(() => {
      const replies = [
        "That sounds amazing! 😊",
        "I'd love to hear more about that!",
        "Absolutely! When are you free?",
        "That's so cool! I've always wanted to try that.",
        "You seem really interesting! 💖"
      ];
      
      const reply = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date(),
        fromSelf: false
      };
      
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  if (selectedMatch) {
    // Chat view
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setSelectedMatch(null)}
            className="text-2xl hover:bg-gray-100 rounded-full p-1"
          >
            ←
          </button>
          
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200">
            {selectedMatch.profile.photos[0] ? (
              <img
                src={selectedMatch.profile.photos[0]}
                alt={selectedMatch.profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                👤
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">{selectedMatch.profile.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Online
            </div>
          </div>
          
          <button className="text-2xl hover:bg-gray-100 rounded-full p-2">
            📞
          </button>
          
          <button className="text-2xl hover:bg-gray-100 rounded-full p-2">
            📹
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Match notification */}
          <div className="text-center py-8">
            <div className="inline-block bg-pink-100 rounded-2xl p-6">
              <div className="text-4xl mb-2">💖</div>
              <p className="text-pink-600 font-medium">You matched with {selectedMatch.profile.name}!</p>
              <p className="text-gray-500 text-sm mt-1">Start the conversation</p>
            </div>
          </div>

          {/* Existing messages */}
          {selectedMatch.lastMessage && (
            <div className={`flex ${selectedMatch.lastMessage.fromSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-2xl ${
                selectedMatch.lastMessage.fromSelf
                  ? 'bg-pink-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p>{selectedMatch.lastMessage.text}</p>
                <p className={`text-xs mt-1 ${
                  selectedMatch.lastMessage.fromSelf ? 'text-pink-100' : 'text-gray-500'
                }`}>
                  {formatTime(selectedMatch.lastMessage.timestamp)}
                </p>
              </div>
            </div>
          )}

          {/* New messages */}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.fromSelf ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-3 rounded-2xl ${
                msg.fromSelf
                  ? 'bg-pink-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.fromSelf ? 'text-pink-100' : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <button className="text-2xl hover:bg-gray-100 rounded-full p-2">
              📷
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:border-pink-500 pr-12"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                  message.trim() ? 'bg-pink-500 hover:bg-pink-600' : 'bg-gray-300'
                }`}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Matches list view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Matches</h1>
            <p className="text-gray-600 text-sm">Start a conversation with your matches</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigateTo('swipe')} aria-label="Discover" className="text-gray-500 hover:text-pink-500 p-2 rounded-full">
              <span className="text-2xl">🔥</span>
            </button>
            <button onClick={() => navigateTo('profile')} aria-label="Profile" className="text-gray-500 hover:text-pink-500 p-2 rounded-full">
              <span className="text-2xl">👤</span>
            </button>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl">💬</div>
            <h2 className="text-2xl font-bold text-gray-800">No matches yet</h2>
            <p className="text-gray-600">
              Keep swiping to find people who are interested in you!
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-2">
          {matches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMatch(match)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200">
                    {match.profile.photos[0] ? (
                      <img
                        src={match.profile.photos[0]}
                        alt={match.profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {match.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                      {match.unreadCount}
                    </div>
                  )}
                  
                  {match.profile.verified && (
                    <div className="absolute -bottom-1 -right-1 text-lg">
                      ✅
                    </div>
                  )}
                </div>

                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {match.profile.name}
                    </h3>
                    <span className="text-lg">
                      {match.profile.nationality === 'US' && '🇺🇸'}
                      {match.profile.nationality === 'ES' && '🇪🇸'}
                      {match.profile.nationality === 'IN' && '🇮🇳'}
                      {match.profile.nationality === 'FR' && '🇫🇷'}
                      {match.profile.nationality === 'AU' && '🇦🇺'}
                      {match.profile.nationality === 'DE' && '🇩🇪'}
                    </span>
                  </div>
                  
                  {match.lastMessage ? (
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        match.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-600'
                      }`}>
                        {match.lastMessage.fromSelf ? 'You: ' : ''}
                        {match.lastMessage.text}
                      </p>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(match.lastMessage.timestamp)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Say hello to your new match! 👋
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="text-gray-400">
                  →
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}