import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Deine Firebase-Konfig
export const firebaseConfig = {
  apiKey: "AIzaSyDUZ51ZSaWvYNfMgxRH3FmXIYDTk_sk2P0",
  authDomain: "helpinformatik.firebaseapp.com",
  projectId: "helpinformatik",
  storageBucket: "helpinformatik.appspot.com",
  messagingSenderId: "1036573792326",
  appId: "1:1036573792326:web:763742e7cf12fc46ebd247",
  measurementId: "G-K210BD89H6"
};

// Initialisiere Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Exportiere DB + Token-Loader
export const db = getDatabase(app, "https://helpinformatik-default-rtdb.europe-west1.firebasedatabase.app");

export async function loadTokenFromFirebase() {
  const tokenRef = ref(db, 'github_token'); // ✅ RICHTIG

  const snapshot = await get(tokenRef);

  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    throw new Error("Token nicht gefunden.");
  }
}
