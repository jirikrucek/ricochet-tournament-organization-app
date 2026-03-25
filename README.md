# Ricochet Tournament Organization App

A comprehensive web-based tournament management system specifically designed for organizing Ricochet tournaments (a competitive sport similar to racquetball). This application provides both public viewing and administrative tournament management capabilities.

## 🎯 Overview

The **Ricochet Tournament Organization App** enables tournament organizers to manage complex tournament brackets, track matches in real-time, and provide spectators with live updates. It requires a Supabase (PostgreSQL) backend for all domain data persistence and uses Supabase Auth for admin authentication.

## ✨ Core Features

### For Tournament Organizers (Admin)
- ✅ Create and manage multiple tournaments
- ✅ Register and manage players with country flags and ELO ratings
- ✅ Organize matches into Winners and Losers brackets (Brazilian double elimination system)
- ✅ Enter match scores and track micro-points
- ✅ Assign matches to courts
- ✅ Manage tournament status (setup → live → finished)

### For Spectators/Players (Public)
- 👀 Live tournament view with real-time updates
- 📊 View match schedules and results
- 🏆 Check tournament standings and rankings
- 📱 Access bracket visualizations
- 👥 View player profiles and statistics
- 📲 Generate QR codes for match sharing

## 🎯 How It Works

### Tournament Bracket System
The app uses a **Brazilian double elimination** format:
- **Winners Bracket**: Players compete until they lose once
- **Losers Bracket**: Players who lost once get a second chance
- **Grand Finals**: The final match between the winners of both brackets

### Multiple Language Support
Available in 5 languages with automatic browser language detection:
- 🇬🇧 English
- 🇵🇱 Polish  
- 🇩🇪 German
- 🇳🇱 Dutch
- 🇨🇿 Czech

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your computer ([Download here](https://nodejs.org/))

### Installation

1. Clone or download this repository:
```bash
git clone https://github.com/jirikrucek/ricochet-tournament-organization-app.git
cd ricochet-tournament-organization-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase (required):
   - Run a local Supabase instance or create an account at [Supabase](https://supabase.com)
   - Copy `.env.example` to `.env.local` and add your Supabase URL and anon key
   - The app will not start without valid Supabase configuration

4. Start the app:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

### Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌟 What Makes This App Special

- ✨ **Real-Time Updates** - Live tournament progress via Supabase
- ✨ **Multilingual** - Available in 5 languages
- ✨ **Mobile-Friendly** - Works on phones, tablets, and computers
- ✨ **Easy to Use** - Intuitive interface for both organizers and spectators
- ✨ **Specialized for Ricochet** - Built specifically for tournament management
- ✨ **Secure Admin** - Email/password authentication via Supabase Auth with admin allowlist

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🏆 About Ricochet

Ricochet is a competitive sport similar to racquetball, played in tournaments with specific bracket formats. This application is designed to handle the unique requirements of Ricochet tournament organization, including the Brazilian double elimination format with specialized bracket drop patterns.

---

**Built with ❤️ for the Ricochet community**
