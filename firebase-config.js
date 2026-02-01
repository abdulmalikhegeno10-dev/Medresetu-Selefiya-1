// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, getDoc, where, getDocs, serverTimestamp, setDoc, deleteDoc, increment, limit } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNthcUeBntlUnfEChPOTUHpJLr-eQZIuk",
  authDomain: "medresetu-selefiya-1.firebaseapp.com",
  projectId: "medresetu-selefiya-1",
  storageBucket: "medresetu-selefiya-1.firebasestorage.app",
  messagingSenderId: "782147862134",
  appId: "1:782147862134:web:c44071561521d8e6b7e957",
  measurementId: "G-M9BRYMP9XP"
};

console.log('🔥 Starting Firebase initialization...');

// Initialize Firebase
let app, auth, db, analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App initialized');
  
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  analytics = getAnalytics(app);
  console.log('✅ Analytics initialized');
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Auto sign-in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log('✅ Anonymous sign-in successful!');
  })
  .catch((error) => {
    console.error('❌ Auth Error:', error.code, error.message);
  });

// Export to window for global access
window.auth = auth;
window.db = db;
window.analytics = analytics;

// Export Firestore functions
window.collection = collection;
window.addDoc = addDoc;
window.onSnapshot = onSnapshot;
window.query = query;
window.orderBy = orderBy;
window.updateDoc = updateDoc;
window.doc = doc;
window.getDoc = getDoc;
window.where = where;
window.getDocs = getDocs;
window.serverTimestamp = serverTimestamp;
window.setDoc = setDoc;
window.deleteDoc = deleteDoc;
window.increment = increment;
window.limit = limit;

// Export Auth functions
window.onAuthStateChanged = onAuthStateChanged;

console.log('🎉 Firebase fully configured and ready!');
console.log('📊 Project: Medresetu Selefiya');

// Enable offline persistence
import { enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ Offline mode enabled!');
  })
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('⚠️ Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.log('⚠️ Browser does not support offline');
    }
  });