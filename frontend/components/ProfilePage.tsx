'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/context';
import { MOCK_CURRENT_USER } from '@/lib/mockData';

interface ProfilePageProps {}

export default function ProfilePage({}: ProfilePageProps) {
  const { user, disconnect, navigateTo } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  
  // Use disclosed data from user context, fallback to mock data for demo
  const disclosedData = user?.disclosedData;
  const [profile, setProfile] = useState({
    ...MOCK_CURRENT_USER,
    // Override with actual disclosed data if available
    ...(disclosedData?.nationality && { nationality: disclosedData.nationality }),
    ...(disclosedData?.gender && { gender: disclosedData.gender }),
    ...(disclosedData?.name && { name: disclosedData.name }),
  });

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you'd save to backend here
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = e.target?.result as string;
        setProfile(prev => ({
          ...prev,
          photos: [newPhoto, ...prev.photos.slice(0, 5)] // Max 6 photos
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => navigateTo('swipe')} aria-label="Discover" className="text-gray-500 hover:text-pink-500 p-2 rounded-full">
              <span className="text-2xl">🔥</span>
            </button>
            <button onClick={() => navigateTo('matches')} aria-label="Matches" className="text-gray-500 hover:text-pink-500 p-2 rounded-full">
              <span className="text-2xl">💬</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Profile Photos */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📸 Photos
            {profile.verified && <span className="text-green-500">✅ Verified</span>}
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            {profile.photos.map((photo, index) => (
              <div key={index} className="aspect-square relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          photos: prev.photos.filter((_, i) => i !== index)
                        }));
                      }}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {profile.photos.length < 6 && isEditing && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors">
                <div className="text-center">
                  <div className="text-2xl mb-1">+</div>
                  <span className="text-xs text-gray-500">Add Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">👤 Basic Info</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing && !disclosedData?.name ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="Enter your name (optional)"
                />
              ) : disclosedData?.name ? (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-800 font-medium">{disclosedData.name}</span>
                  <span className="text-green-600 text-xs ml-2">✓ Verified - Cannot edit</span>
                </div>
              ) : (
                <p className="text-gray-500 p-3 bg-gray-50 rounded-lg italic">
                  {profile.name || "No name provided"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    placeholder="Enter your age (optional)"
                    min="18"
                    max="100"
                  />
                ) : (
                  <p className="text-gray-500 p-3 bg-gray-50 rounded-lg italic">
                    {profile.age || "Age not specified"}
                  </p>
                )}
              </div>

              {/* Only show nationality if it was disclosed */}
              {disclosedData?.nationality && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality <span className="text-green-600 text-xs">✓ Verified - Cannot Edit</span>
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-2xl">
                      {disclosedData.nationality === 'US' && '🇺🇸'}
                      {disclosedData.nationality === 'ES' && '🇪🇸'}
                      {disclosedData.nationality === 'IN' && '🇮🇳'}
                      {disclosedData.nationality === 'FR' && '🇫🇷'}
                      {disclosedData.nationality === 'AU' && '🇦🇺'}
                      {disclosedData.nationality === 'DE' && '🇩🇪'}
                      {disclosedData.nationality === 'CA' && '🇨🇦'}
                      {disclosedData.nationality === 'UK' && '🇬🇧'}
                    </span>
                    <span className="text-gray-800 font-medium">{disclosedData.nationality}</span>
                    <div className="ml-auto">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🔒 Locked</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Only show gender if it was disclosed */}
            {disclosedData?.gender && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-green-600 text-xs">✓ Verified - Cannot Edit</span>
                </label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex justify-between items-center">
                  <span className="text-gray-800 font-medium">
                    {disclosedData.gender === 'M' ? 'Male' : 'Female'}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🔒 Locked</span>
                </div>
              </div>
            )}

            {/* Only show name if it was disclosed */}
            {disclosedData?.name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-green-600 text-xs">✓ Verified</span>
                </label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-800 font-medium">{disclosedData.name}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="Tell people about yourself... (optional)"
                />
              ) : (
                <p className="text-gray-500 p-3 bg-gray-50 rounded-lg italic">
                  {profile.bio || "No bio provided"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">🛡️ Verification & Privacy</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-green-800">Identity Verified</p>
                  <p className="text-sm text-green-600">Self Protocol verification complete</p>
                </div>
              </div>
              <span className="text-green-600 font-semibold">✅</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  🔗
                </div>
                <div>
                  <p className="font-medium text-blue-800">Wallet Connected</p>
                  <p className="text-sm text-blue-600">{user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}</p>
                </div>
              </div>
              <span className="text-blue-600 font-semibold">✅</span>
            </div>

            {/* Show what data was disclosed */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">Disclosed Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Age Verification (18+)</span>
                  <span className="text-green-600 font-medium">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Nationality</span>
                  <span className={disclosedData?.nationality ? "text-green-600 font-medium" : "text-gray-400"}>
                    {disclosedData?.nationality ? "✓ Disclosed" : "🔒 Private"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gender</span>
                  <span className={disclosedData?.gender ? "text-green-600 font-medium" : "text-gray-400"}>
                    {disclosedData?.gender ? "✓ Disclosed" : "🔒 Private"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Full Name</span>
                  <span className={disclosedData?.name ? "text-green-600 font-medium" : "text-gray-400"}>
                    {disclosedData?.name ? "✓ Disclosed" : "🔒 Private"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date of Birth</span>
                  <span className={disclosedData?.date_of_birth ? "text-green-600 font-medium" : "text-gray-400"}>
                    {disclosedData?.date_of_birth ? "✓ Disclosed" : "🔒 Private"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Passport Number</span>
                  <span className={disclosedData?.passport_number ? "text-green-600 font-medium" : "text-gray-400"}>
                    {disclosedData?.passport_number ? "✓ Disclosed" : "🔒 Private"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">⚙️ Settings</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <span className="font-medium">Notifications</span>
              </div>
              <span className="text-gray-400">→</span>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌍</span>
                <span className="font-medium">Discovery Preferences</span>
              </div>
              <span className="text-gray-400">→</span>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <span className="font-medium">Privacy</span>
              </div>
              <span className="text-gray-400">→</span>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xl">❓</span>
                <span className="font-medium">Help & Support</span>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-red-600">🚨 Account</h2>
          
          <div className="space-y-3">
            <button className="w-full p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600 font-medium">
              Pause My Account
            </button>
            
            <button
              onClick={disconnect}
              className="w-full p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600 font-medium"
            >
              Disconnect Wallet
            </button>
            
            <button className="w-full p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600 font-medium">
              Delete Account
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📊 Your Stats</h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">47</div>
              <div className="text-sm text-gray-600">Likes Given</div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Matches</div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Conversations</div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-gray-500 text-sm pb-8">
          <p>Nomad Dating v1.0.0</p>
          <p>Powered by Self Protocol</p>
        </div>
      </div>
    </div>
  );
}