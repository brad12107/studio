
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// IMPORTANT: Replace with your actual Firebase project configuration
// You can find this in your Firebase project settings:
// Project Overview > Project settings (gear icon) > General tab > Your apps > Web app > SDK setup and configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace this
  authDomain: "YOUR_AUTH_DOMAIN", // Replace this
  projectId: "YOUR_PROJECT_ID", // Replace this
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace this (e.g., "your-project-id.appspot.com")
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace this
  appId: "YOUR_APP_ID" // Replace this
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Get a reference to the storage service, which is used to create references in your storage bucket
// This will only work if you have properly configured firebaseConfig above.
let storage;
try {
  storage = getStorage(app);
} catch (error) {
  console.error("Firebase Storage could not be initialized. Ensure firebaseConfig is correct in src/lib/firebase.ts and Firebase Storage is enabled in your Firebase project.", error);
  // storage will remain undefined if initialization fails
}

export { app, storage };
