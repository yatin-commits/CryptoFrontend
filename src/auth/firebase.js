// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD-XgBR3Mxh1IQ_7Z63McEdRw26WZwhTtQ",
    authDomain: "cryptotrade-33c45.firebaseapp.com",
    projectId: "cryptotrade-33c45",
    storageBucket: "cryptotrade-33c45.firebasestorage.app",
    messagingSenderId: "1086500589001",
    appId: "1:1086500589001:web:3b8adc95f596ce1c9eac18",
    measurementId: "G-CF0R99CYZW"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
console.log("just initialized the app");

const auth = getAuth(app);
console.log("just initialized the auth service");

const googleProvider = new GoogleAuthProvider();

// Set up auth settings if needed
auth.useDeviceLanguage();

// Export the services
export { auth, googleProvider };