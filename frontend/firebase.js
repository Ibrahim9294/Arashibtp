// ==========================================
// FIREBASE - ENTREPRISE ARASHI
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBfeVEi48HzJEsv2V8IINeOKutVF40YT7Q",
    authDomain: "entreprise-arashi.firebaseapp.com",
    projectId: "entreprise-arashi",
    storageBucket: "entreprise-arashi.firebasestorage.app",
    messagingSenderId: "468316551281",
    appId: "1:468316551281:web:1827614fe1ad32e60ac3d0",
    measurementId: "G-KCGS3DXJ5L"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Base de données
const db = getFirestore(app);

// Stockage
const storage = getStorage(app);

// Rendre disponibles dans script.js
window.db = db;
window.storage = storage;

window.firebaseFunctions = {
    collection,
    addDoc,
    ref,
    uploadBytes,
    getDownloadURL
};

console.log("✅ Firebase ARASHI connecté");