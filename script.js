// Firebase-Authentifizierung initialisieren
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    // Objekt für Login-Versuche
    const loginAttempts = {
        count: 0,
        lastAttempt: 0,
        lockoutTime: 0
    };

    // Maximale Anzahl von Versuchen und Wartezeiten
    const MAX_ATTEMPTS = 3;
    const LOCKOUT_DURATION = 300000; // 5 Minuten in Millisekunden
    const ATTEMPT_RESET_TIME = 600000; // 10 Minuten in Millisekunden

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Prüfen ob der Account gesperrt ist
        if (loginAttempts.lockoutTime > Date.now()) {
            const remainingTime = Math.ceil((loginAttempts.lockoutTime - Date.now()) / 1000 / 60);
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Zu viele Fehlversuche. Bitte warten Sie ${remainingTime} Minuten.`;
            return;
        }

        // Zurücksetzen der Versuche nach ATTEMPT_RESET_TIME
        if (Date.now() - loginAttempts.lastAttempt > ATTEMPT_RESET_TIME) {
            loginAttempts.count = 0;
        }

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Button deaktivieren und Ladezustand anzeigen
        submitButton.disabled = true;
        submitButton.textContent = 'Wird angemeldet...';
        
        try {
            // Anmeldung mit Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Bei erfolgreicher Anmeldung zurücksetzen
            loginAttempts.count = 0;
            loginAttempts.lockoutTime = 0;
            
            // Zur Homepage weiterleiten
            window.location.href = 'src/homepage/index.html';
            
        } catch (error) {
            // Fehlversuch zählen
            loginAttempts.count++;
            loginAttempts.lastAttempt = Date.now();

            // Prüfen ob maximale Versuche erreicht
            if (loginAttempts.count >= MAX_ATTEMPTS) {
                loginAttempts.lockoutTime = Date.now() + LOCKOUT_DURATION;
                errorMessage.textContent = 'Zu viele Fehlversuche. Bitte warten Sie 5 Minuten.';
                submitButton.disabled = true;
                setTimeout(() => {
                    submitButton.disabled = false;
                }, LOCKOUT_DURATION);
            } else {
                // Normale Fehlermeldungen anzeigen
                errorMessage.style.display = 'block';
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage.textContent = `Ungültige E-Mail-Adresse. Noch ${MAX_ATTEMPTS - loginAttempts.count} Versuche übrig.`;
                        break;
                    case 'auth/user-disabled':
                        errorMessage.textContent = 'Dieser Account wurde deaktiviert.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage.textContent = `Kein Benutzer mit dieser E-Mail-Adresse gefunden. Noch ${MAX_ATTEMPTS - loginAttempts.count} Versuche übrig.`;
                        break;
                    case 'auth/wrong-password':
                        errorMessage.textContent = `Falsches Passwort. Noch ${MAX_ATTEMPTS - loginAttempts.count} Versuche übrig.`;
                        break;
                    default:
                        errorMessage.textContent = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
                }
            }
        } finally {
            // Button wieder aktivieren und Text zurücksetzen
            submitButton.disabled = false;
            submitButton.textContent = 'Anmelden';
        }
    });

    // Speichern der Login-Versuche im localStorage
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
    });

    // Laden der Login-Versuche aus dem localStorage
    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
        const parsed = JSON.parse(savedAttempts);
        loginAttempts.count = parsed.count;
        loginAttempts.lastAttempt = parsed.lastAttempt;
        loginAttempts.lockoutTime = parsed.lockoutTime;

        // Prüfen ob der Account gesperrt ist
        if (loginAttempts.lockoutTime > Date.now()) {
            const remainingTime = Math.ceil((loginAttempts.lockoutTime - Date.now()) / 1000 / 60);
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Zu viele Fehlversuche. Bitte warten Sie ${remainingTime} Minuten.`;
            submitButton.disabled = true;
        }
    }
});