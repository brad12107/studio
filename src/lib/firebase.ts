
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

// Function to check if the config seems to be using placeholders
function isConfigLikelyPlaceholder(config: typeof firebaseConfig): boolean {
  // This check is to guide you. If your actual keys happen to be "YOUR_API_KEY", this will need adjustment.
  return (
    config.apiKey === "YOUR_API_KEY" ||
    config.authDomain === "YOUR_AUTH_DOMAIN" ||
    config.projectId === "YOUR_PROJECT_ID" ||
    config.storageBucket === "YOUR_STORAGE_BUCKET" ||
    config.messagingSenderId === "YOUR_MESSAGING_SENDER_ID" ||
    config.appId === "YOUR_APP_ID" ||
    config.apiKey === "ACTUAL_API_KEY_FROM_FIREBASE_CONSOLE" // Catching previous explicit placeholders
  );
}

// Initialize Firebase
let app;
let storage;

if (typeof window !== 'undefined' && isConfigLikelyPlaceholder(firebaseConfig)) {
  console.warn(
    "Firebase configuration in src/lib/firebase.ts appears to be using placeholder values. " +
    "Please replace them with your actual Firebase project credentials for Firebase services to work correctly. " +
    "Image uploads and other Firebase features will fail until this is corrected."
  );
}

if (!getApps().length) {
  if (!isConfigLikelyPlaceholder(firebaseConfig)) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Error initializing Firebase app. Ensure firebaseConfig is correct.", e);
    }
  } else {
    // Do not initialize app if config is placeholder, to avoid potential errors with invalid config
    console.error("Firebase app initialization skipped due to placeholder configuration values.");
  }
} else {
  app = getApp();
}

// Get a reference to the storage service, which is used to create references in your storage bucket
// This will only work if you have properly configured firebaseConfig above.
if (app && !isConfigLikelyPlaceholder(firebaseConfig)) {
  try {
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase Storage could not be initialized. Ensure firebaseConfig is correct in src/lib/firebase.ts and Firebase Storage is enabled in your Firebase project.", error);
    // storage will remain undefined if initialization fails
  }
} else {
  if (isConfigLikelyPlaceholder(firebaseConfig)) {
    // This console.warn is slightly different from the one for app initialization.
    // This more directly indicates storage initialization is skipped due to placeholder app config.
    console.warn("Firebase Storage initialization skipped because Firebase app was not initialized (or uses placeholder configuration values).");
  } else if (!app) {
    console.warn("Firebase Storage initialization skipped because Firebase app is not available (was not initialized).");
  }
}

export { app, storage };
