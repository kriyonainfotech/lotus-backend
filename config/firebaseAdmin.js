import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let firebaseApp;

const initFirebase = () => {
  if (admin.apps.length > 0) return admin.apps[0];

  // Method 1: Use serviceAccountKey.json file if it exists
  const keyPath = path.join(__dirname, '../serviceAccountKey.json');
  if (existsSync(keyPath)) {
    const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized via serviceAccountKey.json');
    return firebaseApp;
  }

  // Method 2: Use GOOGLE_APPLICATION_CREDENTIALS env variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅ Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS');
    return firebaseApp;
  }

  // Method 3: Fallback - Project ID only (limited functionality, for dev/test)
  console.warn('⚠️  Firebase Admin: No serviceAccountKey.json found. Using limited mode.');
  console.warn('    Steps to fix: Go to Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
  console.warn('    Save the file as: backend/serviceAccountKey.json');
  firebaseApp = admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'lotus-app-8fc18',
  });
  return firebaseApp;
};

export { admin, initFirebase };
