// =========================================================
// YAHAN APNI FIREBASE PROJECT KI DETAILS DAALO
// README.md mein step-by-step tarika likha hai ye kaise milega
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyDKNCLCXc5-cGTqVYggin3bSkbsdd_NUmM",
  authDomain: "apna-style-study.firebaseapp.com",
  projectId: "apna-style-study",
  messagingSenderId: "549086371464",
  appId: "1:549086371464:web:12e426bcd9b0a46314493d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =========================================================
// FILE STORAGE — Cloudinary (free, card ki zaroorat nahi)
// Firebase Storage ab Blaze (paid card-linked) plan ke bina
// nahi milta (Feb 2026 policy change), isliye files
// (photos/videos/pdf/ppt) Cloudinary pe upload hoti hain,
// aur sirf unka URL Firestore mein save hota hai.
// README.md mein step-by-step setup likha hai.
// =========================================================
const CLOUDINARY_CLOUD_NAME = "dbokhpabo";
const CLOUDINARY_UPLOAD_PRESET = "apna_style";

// WhatsApp number jispe signup ka data confirmation ke liye jayega
const WHATSAPP_NUMBER = "919263430050";

// Pseudo-email domain — Firebase Auth ko email chahiye hota hai,
// isliye username ko "username@apnastyle.local" banake login karwate hain
const AUTH_DOMAIN_SUFFIX = "@apnastyle.local";
