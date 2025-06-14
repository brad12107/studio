
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// IMPORTANT: Replace with your actual Firebase project configuration
// You can find this in your Firebase project settings:
// Project Overview > Project settings (gear icon) > General tab > Your apps > Web app > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ2ty73IaqcHs0nIaQb5Djglu3soBqR-U",
  authDomain: "community-market-rgnru.firebaseapp.com",
  projectId: "community-market-rgnru",
  storageBucket: "community-market-rgnru.firebasestorage.app",
  messagingSenderId: "27779111166",
  appId: "1:27779111166:web:6d62ec425ca90279da2daf"
};


// Function to check if the config seems to be using placeholders
function isConfigLikelyPlaceholder(config: typeof firebaseConfig): boolean {
  return (
  // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ2ty73IaqcHs0nIaQb5Djglu3soBqR-U",
  authDomain: "community-market-rgnru.firebaseapp.com",
  projectId: "community-market-rgnru",
  storageBucket: "community-market-rgnru.firebasestorage.app",
  messagingSenderId: "27779111166",
  appId: "1:27779111166:web:6d62ec425ca90279da2daf"
};
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
      // app will remain undefined, and storage initialization will be skipped.
    }
  } else {
    // Do not initialize app if config is placeholder, to avoid potential errors with invalid config
    console.error("Firebase app initialization skipped due to placeholder configuration values.");
    // app will remain undefined, and storage initialization will be skipped.
  }
} else {
  app = getApp();
}

// Get a reference to the storage service, which is used to create references in your storage bucket
// This will only work if you have properly configured firebaseConfig above and app was initialized.
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
