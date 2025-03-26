 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDUZ51ZSaWvYNfMgxRH3FmXIYDTk_sk2P0",
    authDomain: "helpinformatik.firebaseapp.com",
    projectId: "helpinformatik",
    storageBucket: "helpinformatik.appspot.com",
    messagingSenderId: "1036573792326",
    appId: "1:1036573792326:web:763742e7cf12fc46ebd247",
    measurementId: "G-K210BD89H6"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
