
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
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

// تهيئة التطبيق مرة واحدة فقط
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// تهيئة Firestore مع تفعيل Long Polling لتجاوز قيود الشبكة
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
