🎓 CampusOne – Smart Campus Complaint & Management System

Bridging the gap between students and administration with real-time tracking and seamless campus management.

CampusOne is a mobile-first smart campus application built using React Native (Expo) and Firebase, designed to simplify complaint management, mess feedback, and campus analytics.
It implements a secure Role-Based Access Control (RBAC) system with separate experiences for Students and Admins/Wardens.

📱 Key Features
🛡️ Role-Based Access Control (RBAC)

*Student Portal

*Raise campus complaints
*Track complaint status in real-time
*Rate mess meals
*View campus events

Admin / Warden Dashboard

*View all complaints
*Update complaint statuses
*Access analytics & resolution insights
*Security
*Admin access verified using a Firestore whitelist
*No unauthorized role switching

🚨 Complaint Management

*Live Status Updates
*Pending → In Progress → Resolved
*Image Evidence Support
*Upload photos for maintenance issues
*Priority Handling
*High-priority complaints are highlighted for faster action

📊 Mess & Campus Analytics

*Meal Feedback System
*Taste
*Hygiene
*Quantity
*Auto-calculated Weekly Averages
*Admin Analytics Dashboard
*Resolution time tracking
Category-wise issue breakdown
(Water, WiFi, Electricity, Maintenance, etc.)

🛠️ Tech Stack

*Frontend: React Native, Expo, Expo Router
*Backend / Database: Firebase (Firestore, Authentication)
*Image Storage: Cloudinary
*State Management: React Hooks + Firestore Realtime Listener
*Styling: Custom Theme System (Light / Dark Mode)



🚀 Getting Started

1️⃣ Clone the Repository
git clone https://github.com/your-username/CampusOne.git
cd CampusOne

2️⃣ Install Dependencies
npm install

3️⃣ Configure Environment Variables

Create a .env file in the root directory:

EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

4️⃣ Run the App
npx expo start


Scan the QR code using Expo Go on your phone.

📂 Project Structure
src/
├── app/                 # Expo Router Screens
│   ├── (tabs)/          # Tab Navigation (Dashboard, Complaints, Mess)
│   ├── login.tsx        # Authentication Screen
│   └── _layout.tsx      # Root Layout & Auth Logic
├── components/          # Reusable UI Components
├── utils/
│   ├── firebase.js      # Firebase Initialization
│   ├── theme.js         # Theme Configuration
│   └── auth/            # Auth Hooks & Guards
└── assets/              # Images & Icons

📸 Screenshots
🔐 Authentication & Dashboard<
<table> <tr>  <td><img src="https://github.com/user-attachments/assets/d1b34bc4-85ac-422a-885e-ed3b124cb08b" width="250"/></td> <td><img src="https://github.com/user-attachments/assets/49a59ba0-4e40-4ccd-8f73-9dcdf3947b7f" width="250"/></td> </tr> </table>
🚨 Complaints & Tracking
<table> <tr> <td><img src="https://github.com/user-attachments/assets/703de9da-bcf3-45a1-8605-b386ab1d11a7" width="250"/></td> </tr> </table>
📊 Analytics & Mess Feedback
<table> <tr> <td><img src="https://github.com/user-attachments/assets/45e07530-9677-4c3e-896c-bf865f289361" width="250"/></td> <td><img src="https://github.com/user-attachments/assets/692e23ad-7165-4418-825b-4c77716d8ed4" width="250"/></td> </tr> </table>


🤝 Contributing

1. Fork the repository

2. Create a feature branch
git checkout -b feature/AmazingFeature


3. Commit your changes
git commit -m "Add AmazingFeature"

4. Push to the branch
git push origin feature/AmazingFeature

5. Open a Pull Request

Acknowledgements

Built with passion for the Smart Campus Initiative ❤️
