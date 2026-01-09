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
🔐 Authentication & Dashboard
<table> <tr> <td><img src="https://github.com/user-attachments/assets/3b65ff9f-30d4-4380-b08f-080655bd9dd9" width="250"/></td> <td><img src="https://github.com/user-attachments/assets/d1b34bc4-85ac-422a-885e-ed3b124cb08b" width="250"/></td> <td><img src="https://github.com/user-attachments/assets/49a59ba0-4e40-4ccd-8f73-9dcdf3947b7f" width="250"/></td> </tr> </table>
🚨 Complaints & Tracking
<table> <tr> <td><img src="https://github.com/user-attachments/assets/703de9da-bcf3-45a1-8605-b386ab1d11a7" width="250"/></td> <td><img src="https://github.com/user-attachments/assets/d3b75c24-7b76-48b9-83fb-0721dda53935" width="250"/></td> <td><img src="https://github.com/user-attachments/assets/2779ffd3-d6de-43f4-bec5-cf1010c5adb9" width="250"/></td> </tr> </table>
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
