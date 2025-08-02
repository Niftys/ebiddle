// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { getFirestore, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnnAR5drCzJ9tKOHE9y0ydygr4vPs7_iE",
  authDomain: "ebiddlegame.firebaseapp.com",
  projectId: "ebiddlegame",
  storageBucket: "ebiddlegame.firebasestorage.app",
  messagingSenderId: "480005084268",
  appId: "1:480005084268:web:b112b1b2eaab63d266b449",
  measurementId: "G-CRG43HMK58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Analytics helper functions
export const trackEvent = (eventName, parameters = {}) => {
  try {
    logEvent(analytics, eventName, parameters);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackUser = (userId) => {
  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const setUserProps = (properties) => {
  try {
    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export { analytics, db };