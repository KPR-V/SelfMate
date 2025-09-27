'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Match, useApp } from '@/lib/context';
import { MOCK_MATCHES } from '@/lib/mockData';
import { io, Socket } from 'socket.io-client';

interface MatchesPageProps {}

export default function MatchesPage({}: MatchesPageProps) {
  const { navigateTo } = useApp();
  const [matches] = useState<Match[]>(MOCK_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const userId = 'currentUser'; // replace with real user id

  // Init socket once
  useEffect(() => {
    const init = async () => {
      await fetch('/api/socket'); // start server
      if (!socketRef.current) {
        socketRef.current = io({
          path: '/api/socket_io',
        });

        socketRef.current.on('connect', () => {
          // console.log('socket connected');
        });

        // Incoming message handler (expects { roomId, text, senderId, timestamp, id })
        socketRef.current.on('chat-message', (msg: any) => {
          // Only show if in this chat (or if you keep it global remove the check)
            if (selectedMatch && msg.roomId === String(selectedMatch.id)) {
              setMessages(prev => [
                ...prev,
                {
                  id: msg.id,
                  text: msg.text,
                  timestamp: new Date(msg.timestamp),
                  fromSelf: msg.senderId === userId
                }
              ]);
            }
        });
      }
    };
    init();

    return () => {
      socketRef.current?.off('chat-message');
    };
  }, [selectedMatch]);

  // Join room when a match is chosen
  useEffect(() => {
    if (selectedMatch && socketRef.current) {
      socketRef.current.emit('join', String(selectedMatch.id));
      // TODO: fetch past messages for this match from API if you have persistence
    }
  }, [selectedMatch]);

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
    if (!message.trim() || !selectedMatch || !socketRef.current) return;

    // Optimistic append
    const optimistic = {
      id: Date.now(),
      text: message,
      timestamp: new Date(),
      fromSelf: true
    };
    setMessages(prev => [...prev, optimistic]);

    socketRef.current.emit('chat-message', {
      id: optimistic.id,
      roomId: String(selectedMatch.id),
      text: message,
      senderId: userId,
      timestamp: Date.now()
    });

    setMessage('');
  };

  // Background frame (shared by both views)
  const Background = () => (
    <>
      {/* Full screen background image */}
      <div className="fixed inset-0">
        <img
          src="/images/match-bg.png"
          alt="Romantic fantasy castle"
          className="w-full h-full object-cover"
        />
        {/* Soft overlay for readability */}
        <div className="absolute inset-0 bg-pink-100/20 backdrop-blur-[1px]" />
      </div>
    </>
  );

  if (selectedMatch) {
    // Chat view
    return (
      <div className="relative min-h-screen">
        <Background />
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur border-b border-pink-200 p-4 flex items-center gap-3 sticky top-0 z-10">
            <button
              onClick={() => setSelectedMatch(null)}
              className="text-2xl hover:bg-pink-100 rounded-full p-1"
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
            
            <button className="text-2xl hover:bg-pink-100 rounded-full p-2">
              📞
            </button>
            
            <button className="text-2xl hover:bg-pink-100 rounded-full p-2">
              📹
            </button>
          </div>

          {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Match notification */}
            <div className="text-center py-8">
              <div className="inline-block bg-white/20 backdrop-blur rounded-2xl p-6 border border-pink-200/50">
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
                    : 'bg-white/80 backdrop-blur text-gray-800 border border-pink-100 rounded-bl-sm'
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
                    : 'bg-white/80 backdrop-blur text-gray-800 border border-pink-100 rounded-bl-sm'
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
          <div className="p-4 border-t border-pink-200 bg-white/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <button className="text-2xl hover:bg-pink-100 rounded-full p-2">
                📷
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="w-full p-3 border border-pink-300 bg-white/70 backdrop-blur rounded-full focus:outline-none focus:border-pink-500 pr-12"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
                    message.trim() ? 'bg-pink-500 hover:bg-pink-600' : 'bg-pink-200'
                  }`}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Matches list view
  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-6 border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
              <p className="text-gray-500 text-sm mt-1">Connect with your matches</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigateTo('swipe')} 
                aria-label="Discover" 
                className="text-gray-400 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50/80 transition-all duration-200"
              >
                <span className="text-xl">🔥</span>
              </button>
              <button 
                onClick={() => navigateTo('profile')} 
                aria-label="Profile" 
                className="text-gray-400 hover:text-pink-500 p-3 rounded-full hover:bg-pink-50/80 transition-all duration-200"
              >
                <span className="text-xl">👤</span>
              </button>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh] px-6">
            <div className="text-center space-y-6 max-w-md bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 shadow-lg">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl text-gray-400">💬</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">No conversations yet</h2>
                <p className="text-gray-500 leading-relaxed">
                  Start swiping to find people who share your interests and begin meaningful conversations.
                </p>
              </div>
              <button 
                onClick={() => navigateTo('swipe')}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Start Discovering
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <div className="space-y-1">
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedMatch(match)}
                  className="bg-white/80 hover:bg-white/90 backdrop-blur-md rounded-xl p-5 shadow-sm border border-gray-200/50 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Profile Photo */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                        {match.profile.photos[0] ? (
                          <img
                            src={match.profile.photos[0]}
                            alt={match.profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-xl">👤</span>
                          </div>
                        )}
                      </div>
                      
                      {match.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                          {match.unreadCount}
                        </div>
                      )}
                      
                      {match.profile.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Match Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate text-lg">
                          {match.profile.name}
                        </h3>
                        <span className="text-sm opacity-70">
                          {match.profile.nationality === 'US' && '🇺🇸'}
                          {match.profile.nationality === 'ES' && '🇪🇸'}
                          {match.profile.nationality === 'IN' && '🇮🇳'}
                          {match.profile.nationality === 'FR' && '🇫🇷'}
                          {match.profile.nationality === 'AU' && '🇦🇺'}
                          {match.profile.nationality === 'DE' && '🇩🇪'}
                        </span>
                      </div>
                      
                      {match.lastMessage ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-sm truncate ${
                            match.unreadCount > 0 
                              ? 'font-medium text-gray-800' 
                              : 'text-gray-500'
                          }`}>
                            {match.lastMessage.fromSelf && (
                              <span className="text-gray-400">You: </span>
                            )}
                            {match.lastMessage.text}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTime(match.lastMessage.timestamp)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Start a conversation
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300 group-hover:text-gray-400 transition-colors duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}