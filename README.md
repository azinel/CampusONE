# Mobile app (CampusOne)

## Debug & Firestore checks

- Run the Expo app: `npx expo start -c` and open the app in Expo Go or web.
- If the backend (`EXPO_PUBLIC_BASE_URL`) is unavailable, the app falls back to Firestore for Complaints, Events, and Mess feedback.
- Open the **Debug** screen (tab: Debug) to perform smoke tests:
  - Create sample complaint or feedback (uses Firestore `addDoc`).
  - See live lists via Firestore `onSnapshot`.
- If write operations fail with `permission-denied`, sign in using the Auth modal (open automatically when needed) or integrate Firebase Auth and adjust Firestore rules.

## Local backend

- The app expects a backend at `EXPO_PUBLIC_BASE_URL` that proxies API endpoints under `/api/*` (e.g., `/api/complaints`). If you want to rely on server-side logic, start your backend and set `EXPO_PUBLIC_BASE_URL` appropriately in `.env`.

