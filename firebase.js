// ==========================================
// FIREBASE - ENTREPRISE ARASHI
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {

    apiKey: "VOTRE_API_KEY",

    authDomain: "VOTRE_PROJET.firebaseapp.com",

    projectId: "VOTRE_PROJECT_ID",

    storageBucket: "VOTRE_PROJET.appspot.com",

    messagingSenderId: "VOTRE_SENDER_ID",

    appId: "VOTRE_APP_ID"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

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