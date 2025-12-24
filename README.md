# 📸 PicsGram

**A privacy-focused social media platform with innovative one-time profile viewing**

Picsgram is a modern mobile social media application built with React Native and Expo that puts user privacy first. Share your moments through posts, images, and videos while enjoying a unique profile viewing system that gives you control over who sees your content.

<div align="center">
<img src="https://github.com/user-attachments/assets/ab4b9fa6-acf0-46e7-b6c0-01a49c790a88" alt="App Banner" width="300"/>
</div>

---

## ✨ Features

### 🎯 Core Features

- **📝 Create Posts** - Share your thoughts with text, images, and videos
- **❤️ Engage with Content** - Like, comment, and share posts from other users
- **🔔 Live Notifications** - Get instant updates when someone interacts with your posts (in-app notifications)
- **📊 Infinite Scroll** - Smooth pagination for browsing through endless content
- **👤 User Profiles** - Personalized profiles with post history and user information

### 🔐 Privacy & Security

- **Secure Authentication** - Powered by Supabase with robust user authentication
- **Advanced RLS Policies** - Database-level security with Row Level Security
- **Encrypted Data Storage** - Your data is stored securely in Supabase database

### 1️⃣ Unique Feature: One-Time Profile Viewing

<div align="center">

| One-Time Profile Viewing Feature |
|:--------------------------------:|
| ![WhatsApp Image 2025-12-223 at 11 31 10 AM](https://github.com/user-attachments/assets/018896f0-5811-4b68-95c1-70e22a5b13c9) |

</div>

Picsgram introduces an innovative privacy feature that gives users complete control over their profile visibility:

#### How It Works:

1. **Request Access** 
   - User A clicks on User B's avatar or name
   - An alert appears: *"Do you want to send a view profile request to User B?"*
   - User A can choose "Yes" or "Cancel"

2. **Notification Sent**
   - If User A clicks "Yes", User B receives a notification
   - The notification states: *"User A wants to view your profile once"*

3. **Grant Permission**
   - User B can accept or decline the request
   - If accepted, User A receives a notification: *"User B has granted your request for one time"*
   - A "View" button appears in the notification

4. **One-Time Access**
   - User A can view User B's complete profile once
   - Access includes all profile details, posts, and information
   - Once User A navigates away or reloads the app, access expires

5. **New Request Required**
   - To view the profile again, User A must send a new request
   - This ensures ongoing privacy control for all users

<div align="center">
<img src="https://github.com/user-attachments/assets/7744d31f-5654-447f-8067-d49ca07a6aca" alt="Profile Request Flow" width="300"/>
</div>

---

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo Go** - Development and testing platform
- **TypeScript** - Type-safe JavaScript

### Backend
- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Node.js** - Server-side JavaScript runtime

### Key Libraries
- **Expo Router** - File-based routing
- **Supabase Client** - Database and auth integration
- **React Native components** - UI elements


---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go app** on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Atom9950/Picsgram.git
   cd Picsgram
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env` file in the root directory:
     ```env
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (Android)
   - Scan with Camera app (iOS)


---

## 📱 App Screens

### Main Features Showcase

| Home Feed | Create Post | Profile View |
|:----------:|:-----------:|:------------:|
| ![WhatsApp Image 2025-12-22 at 11 31 09 AM (1)](https://github.com/user-attachments/assets/5206b5da-12c0-4640-b0a8-93d8ac778bc1) | ![WhatsApp Image 2025-12-22 at 11 31 10 AM (1)](https://github.com/user-attachments/assets/f9c835f0-7980-4a38-aa57-e40fbf991a86) | ![WhatsApp Image 2025-12-22 at 11 31 10 AM (2)](https://github.com/user-attachments/assets/93fec7e0-7588-4c9e-bb58-ee5305d2cdee) |

| Notifications | Comments | Profile Request |
|:-------------:|:--------:|:---------------:|
| ![WhatsApp Image 2025-12-22 at 11 40 24 AM](https://github.com/user-attachments/assets/9d0743c3-f551-4508-aa96-105d9bbffe11) | ![WhatsApp Image 2025-12-22 at 11 31 11 AM](https://github.com/user-attachments/assets/5eff3160-73eb-45dd-afeb-bcfe703554f9) | ![WhatsApp Image 2025-12-22 at 11 39 40 AM](https://github.com/user-attachments/assets/41b57526-22e5-4ec1-b66d-efca213af952) |

---

## 🎨 Key Functionality

### Post Management
- ✍️ **Create** - Text, image, or video posts
- ✏️ **Edit** - Update your existing posts
- 🗑️ **Delete** - Remove posts you no longer want

### Social Interactions
- 👍 **Like** - Show appreciation for posts
- 💬 **Comment** - Start conversations
- 🔄 **Share** - Spread content with your network

### Profile Features
- 🔒 **Privacy-First** - One-time profile viewing system
- ✏️ **Editable** - Update your profile information
- 📊 **Post History** - View all your shared content

### Notification System
- ⚡ **Real-time** - Instant updates via Supabase subscriptions
- 📬 **Interaction Alerts** - Likes and comments
- 🔔 **Profile Requests** - View profile request notifications
- ✅ **Request Status** - Acceptance/denial notifications


---

## 🏗️ Project Structure

```
Picsgram/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── profile/           # Profile-related screens
├── assets/                # Images, fonts, and static files
├── components/            # Reusable UI components
├── constants/             # App constants and configurations
├── contexts/              # React Context providers
├── helpers/               # Utility functions
├── lib/                   # Third-party library configs
├── services/              # API and backend services
│   ├── supabase/         # Supabase client and queries
│   └── notifications/    # Notification handling
├── scripts/               # Build and deployment scripts
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

---

## 🔒 Database Schema

### Key Tables

**users**
- Profile information
- Authentication details
- User preferences

**posts**
- Post content (text, images, videos)
- User ownership
- Timestamps

**likes**
- User-post relationships
- Like timestamps

**comments**
- Comment content
- User-post relationships
- Timestamps

**profile_requests**
- Request sender and receiver
- Request status (pending, accepted, denied)
- Access expiration tracking

**notifications**
- Notification type
- Related user and post
- Read status


---

## 🔐 Security Features

Picsgram implements multiple layers of security:

### Supabase Row Level Security (RLS)
- Users can only read/write their own data
- Profile visibility controlled by permission system
- Comments and likes properly authorized

### Authentication
- Secure email/password authentication
- Session management
- Token-based authorization

### Data Privacy
- Profile viewing requests logged
- Temporary access grants
- User consent required for profile viewing

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications (FCM/APNS)
- [ ] Direct messaging between users
- [ ] Story feature (24-hour posts)
- [ ] Advanced search and filters
- [ ] Dark mode support
- [ ] Multiple image uploads per post
- [ ] Video trimming and editing
- [ ] Profile analytics
- [ ] Block/Report functionality

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

Please make sure to update tests as appropriate and follow the existing code style.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Atom9950**
- GitHub: [@Atom9950](https://github.com/Atom9950)
- Repository: [Picsgram](https://github.com/Atom9950/Picsgram)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - Amazing React Native framework
- [Supabase](https://supabase.com) - Excellent backend-as-a-service
- [React Native](https://reactnative.dev) - Cross-platform mobile development
- The open-source community for inspiration and support

---

## 📧 Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/Atom9950/Picsgram/issues)
- Check existing issues for solutions
- Provide detailed information about your problem


```
screenshots/
├── banner.png                    # App banner/logo
├── home-feed.png                # Main feed screen
├── create-post.png              # Post creation screen
├── profile.png                  # User profile screen
├── notifications.png            # Notifications screen
├── comments.png                 # Comments section
├── request-alert.png            # Profile request alert
├── profile-request-flow.png     # Flow diagram
├── request-notification.png     # Notification example
├── architecture-diagram.png     # Tech stack diagram
├── setup-guide.png              # Setup visual guide
├── features-collage.png         # Multiple features showcase
└── database-schema.png          # Database structure
```

---

<div align="center">

**Made using React Native and Expo**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/Atom9950/Picsgram/issues) · [Request Feature](https://github.com/Atom9950/Picsgram/issues)

</div>
