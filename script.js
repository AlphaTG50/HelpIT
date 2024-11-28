// Globale Variablen für den Bruteforce-Schutz
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_TIME = 300000; // 5 Minuten in Millisekunden
let loginAttempts = 0;
let lockoutTime = 0;
let lockoutTimer = null; // Timer für automatischen Refresh

function loginUser() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Prüfe ob der Account gesperrt ist
    if (isLockedOut()) {
        const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000 / 60);
        showError(`Zu viele Anmeldeversuche. Bitte warten Sie ${remainingTime} Minuten.`);
        return;
    }

    // Client-seitige Validierung
    if (!validateEmail(email)) {
        showError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return;
    }

    if (password.length < 6) {
        showError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
    }

    // Firebase Auth mit Compat-Version
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login erfolgreich - Reset Bruteforce-Schutz
            resetLoginAttempts();
            console.log('Erfolgreich eingeloggt:', userCredential.user);
            localStorage.setItem('userLoggedIn', 'true');
            window.location.replace('./main/main.html');
        })
        .catch((error) => {
            // Erhöhe Fehlversuche
            incrementLoginAttempts();
            
            // Fehlerbehandlung
            switch (error.code) {
                case 'auth/invalid-email':
                    showError('Ungültige E-Mail-Adresse.');
                    break;
                case 'auth/user-disabled':
                    showError('Dieser Account wurde deaktiviert.');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-login-credentials':
                    showError(`Falsche Zugangsdaten. Noch ${MAX_LOGIN_ATTEMPTS - loginAttempts} Versuche übrig.`);
                    break;
                case 'auth/too-many-requests':
                    showError('Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es später erneut.');
                    break;
                default:
                    showError('Falsche Zugangsdaten.');
            }
        });
}

// Funktion zum Deaktivieren/Aktivieren des Login-Buttons
function toggleLoginButton(disabled) {
    const loginButton = document.querySelector('button[type="submit"]');
    loginButton.disabled = disabled;
    if (disabled) {
        loginButton.style.opacity = '0.5';
        loginButton.style.cursor = 'not-allowed';
    } else {
        loginButton.style.opacity = '1';
        loginButton.style.cursor = 'pointer';
    }
}

// Funktion zum Starten des Countdown-Timers
function startLockoutTimer(duration) {
    clearTimeout(lockoutTimer); // Clear any existing timer
    
    lockoutTimer = setTimeout(() => {
        resetLoginAttempts();
        toggleLoginButton(false);
        location.reload(); // Seite automatisch neu laden
    }, duration);
}

// Bruteforce-Schutz Funktionen aktualisieren
function isLockedOut() {
    if (lockoutTime > Date.now()) {
        const remainingTime = lockoutTime - Date.now();
        toggleLoginButton(true);
        startLockoutTimer(remainingTime); // Starte Timer mit verbleibender Zeit
        return true;
    }
    if (lockoutTime && lockoutTime < Date.now()) {
        resetLoginAttempts();
        toggleLoginButton(false);
    }
    return false;
}

function incrementLoginAttempts() {
    loginAttempts++;
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockoutTime = Date.now() + LOCKOUT_TIME;
        localStorage.setItem('loginLockoutTime', lockoutTime.toString());
        startLockoutTimer(LOCKOUT_TIME); // Starte Timer für volle Sperrzeit
    }
    localStorage.setItem('loginAttempts', loginAttempts.toString());
}

function resetLoginAttempts() {
    loginAttempts = 0;
    lockoutTime = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginLockoutTime');
    clearTimeout(lockoutTimer); // Clear any existing timer
}

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    lockoutTime = parseInt(localStorage.getItem('loginLockoutTime') || '0');
    
    if (isLockedOut()) {
        const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000 / 60);
        showError(`Zu viele Anmeldeversuche. Bitte warten Sie ${remainingTime} Minuten.`);
        toggleLoginButton(true);
    } else {
        toggleLoginButton(false);
    }
});

// Bestehende Hilfsfunktionen
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    if (!message.includes('Bitte warten Sie')) {
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
} 