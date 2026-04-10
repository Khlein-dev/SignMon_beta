# SignMon beta version
Learn Filipino Sign Language through an interactive and gamified mobile experience.

## Overview
SignMon is a mobile application designed to make learning Filipino Sign Language (FSL) accessible, engaging, and effective. It focuses on beginner learners, especially children, by combining structured lessons, video-based instruction, gamification, and interactive features.

The application integrates a chimp companion, cosmetic rewards, and performance-based quizzes to encourage continuous learning and user retention.

---

## Features

### Interactive Lessons
- Lessons are divided into small and manageable portions to prevent cognitive overload.
- Each lesson focuses on a limited set of signs for better understanding and retention.
- Lesson structure and progression are based on expert recommendations.

### Video-Based Learning
- Uses video demonstrations instead of static images.
- Shows proper movement, transitions, and timing of gestures.
- Improves accuracy in performing Filipino Sign Language.

### Chimp Companion
- Acts as a guide throughout the learning process.
- Creates a more interactive and engaging experience.
- Symbolizes gesture-based communication aligned with sign language.

### Cosmetic Reward System
- Users unlock cosmetic items by completing lessons and activities.
- Rewards provide a sense of achievement and progression.
- Encourages repeated use and long-term engagement.

### Gamified Quiz System
- Includes a timer-based quiz for each lesson.
- Users must reach a minimum of 8 points to pass.
- Requires users to perform gestures instead of only recognizing them.
- Makes assessment interactive and game-like.

---

## Tech Stack

- React Native
- Expo (Expo Go)
- JavaScript (JSX)
- Expo Camera (for gesture interaction)
- React Hooks (useState, useEffect)

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/signmon.git
cd signmon

npm install

# Core dependencies
npm install react react-native

# Expo dependencies
npm install expo
npx expo install expo-camera expo-av expo-linear-gradient

# Navigation (if used)
npm install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Additional utilities (optional)
npm install react-native-svg

npx expo start