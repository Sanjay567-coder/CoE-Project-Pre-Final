// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Your Api Key",
  authDomain: "online-outpass.firebaseapp.com",
  projectId: "online-outpass",
  storageBucket: "online-outpass.firebasestorage.app",
  messagingSenderId: "255928719269",
  appId: "1:255928719269:web:cadbdb632a4dd82e333a4c"
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
