'use client'

import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Profile } from '@/lib/context';

interface SwipeCardProps {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTopCard: boolean;
  zIndex: number;
}

export default function SwipeCard({ 
  profile, 
  onSwipeLeft, 
  onSwipeRight, 
  isTopCard, 
  zIndex 
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-30, 0, 30]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const threshold = 150;
    
    if (info.offset.x > threshold) {
      // Swipe right - like
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      // Swipe left - pass
      onSwipeLeft();
    } else {
      // Bounce back
      x.set(0);
    }
  };

  const handleLike = () => {
    x.set(300);
    setTimeout(onSwipeRight, 300);
  };

  const handlePass = () => {
    x.set(-300);
    setTimeout(onSwipeLeft, 300);
  };

  // Show verified badge
  const VerifiedBadge = () => (
    <div className="absolute top-4 right-4 verified-badge z-10">
      ✅ Verified
    </div>
  );

  // Show country flag
  const CountryFlag = ({ nationality }: { nationality: string }) => {
    // Simple flag emoji mapping - in a real app you'd use a more robust solution
    const flagMap: { [key: string]: string } = {
      'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'DE': '🇩🇪',
      'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'BR': '🇧🇷', 'JP': '🇯🇵',
      'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳', 'MX': '🇲🇽', 'NL': '🇳🇱',
    };
    
    return (
      <span className="text-2xl" title={nationality}>
        {flagMap[nationality] || '🏳️'}
      </span>
    );
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm h-[600px] bg-card rounded-2xl shadow-lg border border-border overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity: isTopCard ? 1 : 0.8,
        zIndex,
      }}
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Photo */}
      <div className="relative h-80 bg-gradient-to-br from-pink-100 to-purple-100">
        {profile.photos && profile.photos.length > 0 ? (
          <img 
            src={profile.photos[0]} 
            alt={profile.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          // Placeholder avatar
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl">
              👤
            </div>
          </div>
        )}
        
        {profile.verified && <VerifiedBadge />}
        
        {/* Photo indicators for multiple photos */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {profile.photos.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-6 h-52 flex flex-col">
        <div className="flex-1">
          {/* Name and Age */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold text-text">
              {profile.name}, {profile.age}
            </h3>
            <CountryFlag nationality={profile.nationality} />
          </div>

          {/* Bio */}
          <p className="text-text/70 text-sm mb-4 flex-1 line-clamp-3">
            {profile.bio || "Hello! I'm excited to meet new people and explore the world together! 🌎"}
          </p>
        </div>

        {/* Action Buttons - only show if this is the top card */}
        {isTopCard && (
          <div className="flex justify-center gap-4 pt-4">
            <motion.button
              onClick={handlePass}
              className="w-14 h-14 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-2xl hover:border-red-400 hover:text-red-400 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              ❌
            </motion.button>
            
            <motion.button
              onClick={handleLike}
              className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl hover:bg-primary/80 transition-colors shadow-lg"
              whileTap={{ scale: 0.95 }}
            >
              ❤️
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}