// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDOXNdOBm4w8EhIQEOOJl_CrIM4IjRPXBE",
  authDomain: "gestionale-7ab9a.firebaseapp.com",
  projectId: "gestionale-7ab9a",
  storageBucket: "gestionale-7ab9a.firebasestorage.app",
  messagingSenderId: "269172751294",
  appId: "1:269172751294:web:13d98e1d1a575c73f097ef",
  measurementId: "G-LTXJB9GSD2"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
