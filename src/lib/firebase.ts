import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "unified-zone-z4dh4",
  appId: "1:911108146203:web:4cbd24d70add541c8264be",
  apiKey: "AIzaSyCsNPNzUmK73IR444zl5WlJs54uRPG4-Hg",
  authDomain: "unified-zone-z4dh4.firebaseapp.com",
  storageBucket: "unified-zone-z4dh4.firebasestorage.app",
  messagingSenderId: "911108146203"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-appdashboard-4e933059-b6ff-408d-9c2a-1204c643c03b");

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
