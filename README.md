# Ricochet Tournament Organization App

A comprehensive web-based tournament management system specifically designed for organizing Ricochet tournaments (a competitive sport similar to racquetball). This application provides both public viewing and administrative tournament management capabilities.

## 🎯 Overview

The **Ricochet Polish Open 2026** app enables tournament organizers to manage complex tournament brackets, track matches in real-time, and provide spectators with live updates. It features a dual-mode architecture that works with or without a cloud database, making it highly flexible for different deployment scenarios.

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

### Flexible Deployment
Works both online and offline:
- **With Internet**: Real-time updates across all devices
- **Without Internet**: Works locally using your browser's storage

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

3. (Optional) For real-time updates across devices:
   - Create a free account at [Supabase](https://supabase.com)
   - Copy `.env.example` to `.env` and add your credentials
   - The app works perfectly fine without this step using local storage

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

- ✨ **Works Anywhere** - Functions with or without internet connection
- ✨ **Live Updates** - Real-time tournament progress when online
- ✨ **Multilingual** - Available in 5 languages
- ✨ **Mobile-Friendly** - Works on phones, tablets, and computers
- ✨ **Easy to Use** - Intuitive interface for both organizers and spectators
- ✨ **Specialized for Ricochet** - Built specifically for tournament management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🏆 About Ricochet

Ricochet is a competitive sport similar to racquetball, played in tournaments with specific bracket formats. This application is designed to handle the unique requirements of Ricochet tournament organization, including the Brazilian double elimination format with specialized bracket drop patterns.

---

**Built with ❤️ for the Ricochet community**
