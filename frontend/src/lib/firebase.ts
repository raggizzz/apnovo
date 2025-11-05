import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCnJUIui8UpIow4GjkDivDIu416I4y32Nw",
  authDomain: "velta-a7710.firebaseapp.com",
  projectId: "velta-a7710",
  storageBucket: "velta-a7710.firebasestorage.app",
  messagingSenderId: "242953238028",
  appId: "1:242953238028:web:0435856678fcc6e406e029",
  measurementId: "G-KCGSS0PVXJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  isSupported().then((supported: boolean) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };
