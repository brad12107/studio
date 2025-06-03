import { initializeApp, getApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "ACTUAL_API_KEY_FROM_FIREBASE_CONSOLE",
  authDomain: "ACTUAL_AUTH_DOMAIN_FROM_FIREBASE_CONSOLE",
  projectId: "ACTUAL_PROJECT_ID_FROM_FIREBASE_CONSOLE",
  storageBucket: "ACTUAL_STORAGE_BUCKET_FROM_FIREBASE_CONSOLE",
  messagingSenderId: "ACTUAL_MESSAGING_SENDER_ID_FROM_FIREBASE_CONSOLE",
  appId: "ACTUAL_APP_ID_FROM_FIREBASE_CONSOLE"
};

// Function to check if the config seems to be using placeholders
function isConfigLikelyPlaceholder(config: typeof firebaseConfig): boolean {
  // This check will now be less likely to trigger if you fill in your details,
  // but it's good to keep for future reference.
  return (
    config.apiKey === "YOUR_API_KEY" || config.apiKey === "ACTUAL_API_KEY_FROM_FIREBASE_CONSOLE" || // Example check
    config.authDomain === "YOUR_AUTH_DOMAIN" || config.authDomain === "ACTUAL_AUTH_DOMAIN_FROM_FIREBASE_CONSOLE" ||
    // ... (you might want to adjust this check if your actual keys could be similar to "YOUR_...")
    // For simplicity, the original check is often sufficient if placeholders are clearly distinct.
    config.projectId === "YOUR_PROJECT_ID" ||
    config.storageBucket === "YOUR_STORAGE_BUCKET" ||
    config.messagingSenderId === "YOUR_MESSAGING_SENDER_ID" ||
    config.appId === "YOUR_APP_ID"
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
    console.error("Firebase app initialization skipped due to placeholder configuration values.");
  }
} else {
  app = getApp();
}

if (app && !isConfigLikelyPlaceholder(firebaseConfig)) {
  try {
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase Storage could not be initialized. Ensure firebaseConfig is correct in src/lib/firebase.ts and Firebase Storage is enabled in your Firebase project.", error);
  }
} else {
  if (isConfigLikelyPlaceholder(firebaseConfig)) {
    console.warn("Firebase Storage initialization skipped because Firebase app was not initialized (or uses placeholder configuration values).");
  } else if (!app) {
    console.warn("Firebase Storage initialization skipped because Firebase app is not available (was not initialized).");
  }
}

export { app, storage };