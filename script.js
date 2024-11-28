function loginUser(event) {
    event.preventDefault(); // Verhindert das Standard-Formular-Verhalten

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.querySelector('button[type="submit"]');

    // Button deaktivieren während des Login-Versuchs
    loginButton.disabled = true;
    loginButton.textContent = 'Anmeldung läuft...';

    // Firebase Auth mit Compat-Version
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login erfolgreich
            console.log('Erfolgreich eingeloggt:', userCredential.user);
            errorMessage.style.display = 'none';
            window.location.href = './main/main.html';
        })
        .catch((error) => {
            // Fehlerbehandlung
            errorMessage.style.display = 'block';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage.textContent = 'Ungültige E-Mail-Adresse.';
                    break;
                case 'auth/user-disabled':
                    errorMessage.textContent = 'Dieser Account wurde deaktiviert.';
                    break;
                case 'auth/user-not-found':
                    errorMessage.textContent = 'Kein Benutzer mit dieser E-Mail gefunden.';
                    break;
                case 'auth/wrong-password':
                    errorMessage.textContent = 'Falsches Passwort.';
                    break;
                default:
                    errorMessage.textContent = 'Ein Fehler ist aufgetreten: ' + error.message;
            }
            // Button wieder aktivieren nach Fehler
            loginButton.disabled = false;
            loginButton.textContent = 'Einloggen';
        });
}

// Enter-Taste Unterstützung
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loginUser(e);
            }
        });
    }
}); 