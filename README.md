# 🎓 CampusOne - Smart Campus Complaint & Management System

> **Bridging the gap between students and administration with real-time analytics and seamless issue tracking.**

CampusOne is a robust mobile application built with **React Native (Expo)** and **Firebase** designed to streamline campus maintenance, mess feedback, and event management. It features a secure, **Role-Based Access Control (RBAC)** system that provides distinct interfaces for Students and Wardens/Admins.

---

## 📱 Key Features

### 🛡️ Secure Role-Based Access
* **Student Portal**: Submit complaints, track status in real-time, rate mess meals, and view campus events.
* **Admin/Warden Dashboard**: Access to exclusive analytics, resolution rate charts, and control tools to update complaint statuses.
* **Security**: Admin privileges are strictly verified against a Firestore whitelist—no unauthorized access allowed.

### 🚨 Complaint Management
* **Real-Time Tracking**: Status updates (Pending → In Progress → Resolved) reflect instantly across all devices.
* **Evidence Support**: Users can upload photo evidence for maintenance issues.
* **Priority System**: Admins receive alerts for high-priority issues requiring immediate attention.

### 📊 Mess & Campus Analytics
* **Feedback Loop**: Students rate meals on Taste, Hygiene, and Quantity.
* **Live Insights**: Weekly averages are calculated automatically to monitor food quality trends.
* **Campus Health**: Visual dashboards display resolution times and category breakdowns (Water, WiFi, Electricity, etc.).

---

## 🛠️ Tech Stack

* **Frontend**: React Native, Expo, Expo Router (File-based routing)
* **Backend / Database**: Google Firebase (Firestore, Authentication)
* **Styling**: Custom Theme System (Dark/Light mode support)
* **State Management**: React Hooks & Real-time Firestore Listeners

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository

```git clone [https://github.com/YOUR_USERNAME/CampusOne.git](https://github.com/YOUR_USERNAME/CampusOne.git)```
```cd CampusOne```

2.2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the root directory and add your Firebase configuration keys:

EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

4.Run the App
npx expo start
Scan the QR code with the Expo Go app on your phone to run it.

📂 Project Structure
src/
├── app/                 # Expo Router Screens
│   ├── (tabs)/          # Main Tab Navigation (Dashboard, Complaints, Mess)
│   ├── login.tsx        # Authentication Screen
│   └── _layout.tsx      # Root Layout & Auth Logic
├── components/          # Reusable UI Components (Cards, Buttons, Headers)
├── utils/               # Logic & Configuration
│   ├── firebase.js      # Firebase Initialization
│   ├── theme.js         # Color System
│   └── auth/            # Authentication Hooks
└── assets/              # Images & Icons

📸 Screenshots12Student DashboardAdmin AnalyticsComplaint DetailsMess Feedback(Add Screenshot)(Add Screenshot)(Add Screenshot)(Add Screenshot)

🤝 Contributing
Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request

Built with ❤️ for the Smart Campus Initiative.
