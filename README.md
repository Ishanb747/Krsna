# Krsna - Divine Productivity App

<div align="center">

A beautiful, feature-rich productivity application inspired by divine aesthetics and modern design principles. Built with Next.js, Firebase, and Framer Motion.

</div>

## ✨ Features

### 🎯 Core Productivity Tools
- **Dashboard** - Overview of your tasks, habits, and focus sessions
- **To-Do List** - Organize tasks with drag-and-drop functionality
- **Focus Timer** - Pomodoro-style timer with customizable sessions
- **Journal** - Daily journaling with rich text support
- **Habit Tracker** - Build and maintain positive habits
- **AI Agent** - Your Conversational Accountability partner
- **Settings** - Customize your experience and Agent personality

### 🎨 Beautiful Themes
**Light Themes:**
- Morning Mist - Soft pastel gradients
- Sunny Meadow - Warm, vibrant meadow scene
- Cloudy Sky - Peaceful sky with floating clouds
- Cherry Blossom - Japanese-inspired spring theme
- Ocean Breeze - Calming ocean waves
- Autumn Path - Warm fall colors

**Dark Themes:**
- Starry Night - Van Gogh-inspired cozy night sky
- Midnight Forest - Mysterious forest with fireflies
- Nebula - Cosmic space theme
- Rainy Window - Cozy rainy night view
- Firefly Sanctuary - Magical evening atmosphere
- Aurora Borealis - Northern lights spectacle

**Divine Krishna Themes:**
- Gita Wisdom - Krishna reciting the Bhagavad Gita
- Vishwaroopam - Cosmic form of Vishnu
- Yamuna Night - Serene river at night

### 🔊 Sound Effects
- Interactive UI sounds for clicks and actions
- Focus timer ticking sounds
- Mute/unmute toggle

### 🤖 AI Agent System
> [!IMPORTANT]
> **Laptop/Desktop Users:** Press **`Ctrl + K`** (or `Cmd + K` on Mac) anywhere in the app to activate **Agent Mode**.

- **Conversational Accountability**: Chat with your data (tasks, habits, projects).
- **Proactive Nudges**: The agent monitors your focus and checks in autonomously.
- **Personality Modes**: Choose between **Coach**, **Friend**, **Strict**, or **Guru**.
- **Coaching Styles**:
  - **Narrative Mode**: Experience your productivity as an epic story.
  - **Simulation Mode**: High-intensity regret/future prospection prompts.
- **Strict Focus**: Activates a "Drill Sergeant" mode with video backgrounds and aggressive check-ins during timers.
- **Data Visualizations**: Ask the agent to "Show a graph" for trackers, tasks, or goal progress.

### 🔐 Authentication
- Firebase Authentication
- User profiles with custom avatars
- Secure data storage

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Backend:** [Firebase](https://firebase.google.com/)
  - Authentication
  - Firestore Database
  - Storage
- **Icons:** [Lucide React](https://lucide.dev/)
- **Drag & Drop:** [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd krsna
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore Database
   - Enable Storage
   - Get your Firebase configuration

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
krsna/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/     # Main app pages
│   │   │   ├── focus/
│   │   │   ├── habits/
│   │   │   ├── journal/
│   │   │   ├── settings/
│   │   │   ├── todo/
│   │   │   └── page.tsx     # Dashboard
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── DashboardContent.tsx
│   │   ├── GlobalBackground.tsx
│   │   ├── MusicPlayer.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar.tsx
│   │   └── WelcomeView.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── SoundContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── TimerContext.tsx
│   ├── hooks/
│   ├── lib/
│   │   └── firebase.ts
│   └── types/
├── public/
│   └── themes/              # Theme background images
├── .env.local
├── package.json
└── README.md
```

## 🎮 Usage

### Getting Started
1. **Sign Up/Login** - Create an account or log in
2. **Choose a Theme** - Select from 15+ beautiful themes
3. **Configure the Agent** - Set your personality mode in Settings
4. **Agent Shortcut** - Use **`Ctrl + K`** to toggle the AI Assistant
5. **Start Being Productive!**

### Features Guide

#### To-Do List
- Add tasks with descriptions
- Drag and drop to reorder
- Mark tasks as complete
- Delete completed tasks

#### Focus Timer
- Set custom work/break durations
- Start/pause/reset timer
- Track focus sessions
- Optional ticking sound

#### Journal
- Daily journaling
- Rich text formatting
- Save and review entries
- Search past entries

#### Habit Tracker
- Create custom habits
- Track daily completion
- View streak statistics
- Build consistency

## 🎨 Customization

### Themes
Access theme settings from the sidebar or settings page. Choose from:
- 6 Light themes for daytime productivity
- 6 Dark themes for evening focus
- 3 Divine Krishna themes for spiritual inspiration

### Sounds
Toggle UI sounds and timer ticking from the sidebar mute button.

### Profile
- Upload custom profile picture
- Change display name
- Manage account settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Inspired by divine aesthetics and modern productivity tools
- Theme designs influenced by Van Gogh, Japanese art, and Hindu mythology
- Built with love for productivity enthusiasts

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

<div align="center">
Made with ❤️ for productivity and mindfulness
</div>
