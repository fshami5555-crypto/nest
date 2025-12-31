
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDcOosY_XdKhb5Pu3J4gb7fjq-6x8i0ysw",
  authDomain: "nest-952ca.firebaseapp.com",
  projectId: "nest-952ca",
  storageBucket: "nest-952ca.firebasestorage.app",
  messagingSenderId: "461454319748",
  appId: "1:461454319748:web:2691adc006bed888f2e2d1",
  measurementId: "G-LMFH8WMWYN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
