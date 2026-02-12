import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD6yo-dVgNPVGtDGk0KvPgUpn9u5-zuA_Q",
    authDomain: "khatabook-ac6f7.firebaseapp.com",
    projectId: "khatabook-ac6f7",
    storageBucket: "khatabook-ac6f7.firebasestorage.app",
    messagingSenderId: "253109706811",
    appId: "1:253109706811:web:4a3c3f7af5186d2ebfbc1e",
    measurementId: "G-FT7V4H7W06"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, analytics, googleProvider };