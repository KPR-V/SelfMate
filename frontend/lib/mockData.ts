// Mock data for the app
export const MOCK_PROFILES = [
  {
    id: '1',
    name: 'Sofia',
    age: 25,
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b2e5e5d8?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'
    ],
    bio: 'Digital nomad exploring the world 🌍 Currently in Bali. Love surfing, coffee, and deep conversations. Looking for someone to share adventures with!',
    nationality: 'US',
    verified: true
  },
  {
    id: '2',
    name: 'Elena',
    age: 28,
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop'
    ],
    bio: 'Photographer and travel writer 📸 Based in Barcelona but always on the move. Fluent in 4 languages. Let\'s explore together!',
    nationality: 'ES',
    verified: true
  },
  {
    id: '3',
    name: 'Priya',
    age: 26,
    photos: [
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&h=600&fit=crop'
    ],
    bio: 'Tech entrepreneur and yoga instructor 🧘‍♀️ Building the future while staying mindful. Currently nomading through Southeast Asia.',
    nationality: 'IN',
    verified: true
  },
  {
    id: '4',
    name: 'Marie',
    age: 29,
    photos: [
      'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=400&h=600&fit=crop'
    ],
    bio: 'Chef and food blogger 👩‍🍳 Discovering local cuisines around the world. Currently in Tokyo learning authentic ramen techniques.',
    nationality: 'FR',
    verified: true
  },
  {
    id: '5',
    name: 'Emma',
    age: 24,
    photos: [
      'https://images.unsplash.com/photo-1521575107034-e0fa0b594529?w=400&h=600&fit=crop'
    ],
    bio: 'Freelance designer and surfer 🏄‍♀️ Always chasing the perfect wave and the next creative project. Currently in Costa Rica!',
    nationality: 'AU',
    verified: true
  },
  {
    id: '6',
    name: 'Anna',
    age: 27,
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop'
    ],
    bio: 'Marketing consultant and mountain lover ⛰️ Remote work allows me to ski in the Alps and work from cozy cafes.',
    nationality: 'DE',
    verified: true
  }
];

export const MOCK_MATCHES = [
  {
    id: 'm1',
    profile: MOCK_PROFILES[0], // Sofia
    lastMessage: {
      text: 'Hey! I saw you\'re also in Bali. Want to grab coffee? ☕',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      fromSelf: false
    },
    unreadCount: 2
  },
  {
    id: 'm2',
    profile: MOCK_PROFILES[1], // Elena
    lastMessage: {
      text: 'Your photos from Thailand are amazing! 📸',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      fromSelf: true
    },
    unreadCount: 0
  },
  {
    id: 'm3',
    profile: MOCK_PROFILES[2], // Priya
    lastMessage: {
      text: 'Thanks for the startup advice! Really helpful 🙏',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      fromSelf: false
    },
    unreadCount: 1
  }
];

export const MOCK_CURRENT_USER = {
  id: 'current',
  name: 'Alex',
  age: 27,
  photos: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop'
  ],
  bio: 'Full-stack developer and digital nomad 💻 Currently building the future while exploring the world. Love hiking, coding, and meeting fellow travelers!',
  nationality: 'US',
  verified: true
};