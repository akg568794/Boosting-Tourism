// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-state-e6672.firebaseapp.com",
  projectId: "mern-state-e6672",
  storageBucket: "mern-state-e6672.appspot.com",
  messagingSenderId: "816638790791",
  appId: "1:816638790791:web:dc449d8c3d691595e1bc22"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);