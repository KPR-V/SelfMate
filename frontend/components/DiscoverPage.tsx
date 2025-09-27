'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import { Profile, useApp } from '@/lib/context';
import { MOCK_PROFILES } from '@/lib/mockData';

interface DiscoverPageProps {
  currentUser?: any;
}

export default function DiscoverPage({ currentUser }: DiscoverPageProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [passes, setPasses] = useState(0);
  const { navigateTo } = useApp();
  
  useEffect(() => {
    // Simulate loading profiles
    setTimeout(() => {
      setProfiles(MOCK_PROFILES);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSwipeLeft = () => {
    setPasses(p => p + 1);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    setLikes(l => l + 1);
    setCurrentIndex(prev => prev + 1);
    
    // Show match animation for some profiles (simulate matches)
    const profile = profiles[currentIndex];
    if (profile && Math.random() > 0.7) { // 30% chance of match
      showMatchAnimation(profile);
    }
  };

  const showMatchAnimation = (profile: Profile) => {
    // Create match notification
    const notification = document.createElement('div');
    notification.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-in fade-in duration-300';
    notification.innerHTML = `
      <div class="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 animate-in zoom-in duration-500">
        <div class="text-6xl mb-4">💖</div>
        <h2 class="text-2xl font-bold text-pink-500 mb-2">It's a Match!</h2>
        <p class="text-gray-600 mb-4">You and ${profile.name} liked each other</p>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors">
          Keep Swiping
        </button>
      </div>
    `;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">❤️</div>
          <p className="text-gray-600">Finding amazing people near you...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800">You're all caught up!</h2>
          <p className="text-gray-600">
            You've seen everyone in your area. Check back later for new profiles!
          </p>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">❤️ Likes: {likes}</span>
              <span className="text-gray-500">👋 Passes: {passes}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setPasses(0);
              setLikes(0);
            }}
            className="bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Discover</h1>
            <div className="flex gap-4 text-sm">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                ❤️ {likes}
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                👋 {passes}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('matches')} aria-label="Matches" className="text-gray-500 hover:text-pink-500 p-2 rounded-full">
              <span className="text-2xl">💬</span>
            </button>
            <button onClick={() => navigateTo('profile')} aria-label="Profile" className="text-gray-500 hover:text-pink-500 p-2 rounded-full">
              <span className="text-2xl">👤</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{profiles.length - currentIndex} people nearby</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Cards Container */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-20 pb-24">
        <div className="relative w-full max-w-sm h-[600px]">
          <AnimatePresence mode="wait">
            {/* Next card (background) */}
            {nextProfile && (
              <SwipeCard
                key={`${nextProfile.id}-next`}
                profile={nextProfile}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
                isTopCard={false}
                zIndex={1}
              />
            )}
            
            {/* Current card (foreground) */}
            {currentProfile && (
              <SwipeCard
                key={currentProfile.id}
                profile={currentProfile}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTopCard={true}
                zIndex={2}
              />
            )}
          </AnimatePresence>

          {/* Swipe hints */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-8">
            <div className="text-center opacity-60">
              <div className="text-2xl mb-1">👈</div>
              <span className="text-xs text-gray-500">Pass</span>
            </div>
            <div className="text-center opacity-60">
              <div className="text-2xl mb-1">👆</div>
              <span className="text-xs text-gray-500">Tap photo to see more</span>
            </div>
            <div className="text-center opacity-60">
              <div className="text-2xl mb-1">👉</div>
              <span className="text-xs text-gray-500">Like</span>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-2 rounded">
          Index: {currentIndex}/{profiles.length} | Likes: {likes} | Passes: {passes}
        </div>
      )}
    </div>
  );
}