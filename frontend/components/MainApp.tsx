import React from 'react';
import { useApp } from '@/lib/context';
import LandingPage from '@/components/LandingPage';
import DiscoverPage from '@/components/DiscoverPage';
import MatchesPage from '@/components/MatchesPage';
import ProfilePage from '@/components/ProfilePage';

export default function MainApp() {
  const { currentView, user } = useApp();

  // Show appropriate view based on current state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      
      case 'swipe':
        return <DiscoverPage currentUser={user} />;
      
      case 'matches':
        return <MatchesPage />;
      
      case 'profile':
        return <ProfilePage />;
      
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      {renderCurrentView()}
    </>
  );
}

// Bottom Navigation
export function BottomNavigation() {
  const { currentView, navigateTo, user } = useApp();

  if (!user?.isVerified) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
      <button
        onClick={() => navigateTo('swipe')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
          currentView === 'swipe' ? 'text-pink-500' : 'text-gray-500'
        }`}
      >
        <span className="text-2xl">🔥</span>
        <span className="text-xs font-medium">Discover</span>
      </button>
      
      <button
        onClick={() => navigateTo('matches')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${
          currentView === 'matches' ? 'text-pink-500' : 'text-gray-500'
        }`}
      >
        <span className="text-2xl">💬</span>
        <span className="text-xs font-medium">Matches</span>
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
          3
        </div>
      </button>
      
      <button
        onClick={() => navigateTo('profile')}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
          currentView === 'profile' ? 'text-pink-500' : 'text-gray-500'
        }`}
      >
        <span className="text-2xl">👤</span>
        <span className="text-xs font-medium">Profile</span>
      </button>
    </nav>
  );
}