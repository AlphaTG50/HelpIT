import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { firebaseConfig } from './firebase/firebaseConfig.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let timer;
let locked = false;

document.addEventListener('DOMContentLoaded', async () => {
    const passwordField = document.getElementById('passwordInput');
    const submitButton = document.querySelector('.submit-button');
    const ipAddress = await fetchIPAddress();
    const attemptsRef = doc(db, 'login', `${ipAddress}`);

    try {
        const attemptsDoc = await getDoc(attemptsRef);

        if (attemptsDoc.exists()) {
            const { attempts, lockedUntil, ban } = attemptsDoc.data();
            const now = new Date();

            if (ban) {
                showBanWindow();
                passwordField.disabled = true;
                submitButton.disabled = true;
                return;
            }

            if (attempts >= 5 && lockedUntil && lockedUntil.toMillis() > now.getTime()) {
                passwordField.disabled = true;
                submitButton.disabled = true;
                showLockWindow(lockedUntil);
                locked = true;
                clearPasswordField(passwordField);
            }
        }
    } catch (error) {
        console.error("Error fetching document: ", error);
        window.alert('Fehler beim Abrufen des Dokuments.');
    }

    passwordField.addEventListener('input', function() {
        if (this.value.trim() === '') {
            submitButton.disabled = true;
        } else {
            submitButton.disabled = false;
        }
    });

    submitButton.addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent form submission

        if (passwordField.value.trim() !== '') {
            await abfrage(); // Call the abfrage function
        }
    });

    passwordField.removeEventListener('keydown', enterKeyListener);

    function enterKeyListener(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission via Enter key
            if (passwordField.value.trim() !== '') {
                abfrage(); // Call the abfrage function
            }
        }
    }

    passwordField.addEventListener('keydown', enterKeyListener);
});

window.abfrage = async function() {
    const usernameInput = document.getElementById('usernameInput').value;
    const passwordInput = document.getElementById('passwordInput').value;
    const passwordField = document.getElementById('passwordInput');
    const submitButton = document.querySelector('.submit-button');
    const ipAddress = await fetchIPAddress();
    const attemptsRef = doc(db, 'login', `${ipAddress}`);
    const adminRef = doc(db, 'data', 'admin'); // Referenz zum Admin-Dokument

    try {
        // Ensure document is created if it doesn't exist
        let attemptsDoc = await getDoc(attemptsRef);
        if (!attemptsDoc.exists()) {
            await setDoc(attemptsRef, { attempts: 0, ban: false });
            attemptsDoc = await getDoc(attemptsRef); // Re-fetch the document after creation
        }

        const { attempts, lockedUntil, ban } = attemptsDoc.data();
        const now = new Date();

        if (ban) {
            showBanWindow();
            passwordField.disabled = true;
            submitButton.disabled = true;
            return;
        }

        if (lockedUntil && lockedUntil.toMillis() > now.getTime()) {
            showLockWindow(lockedUntil);
            passwordField.disabled = true;
            submitButton.disabled = true;
            locked = true;
            clearPasswordField(passwordField);
            
            // Start timer only if this is not the last attempt
            if (attempts + 1 < 5) {
                startTimer(lockedUntil.toMillis());
            }
            
            return; // Exit function to prevent further execution
        }

        // Fetch admin credentials
        const adminDoc = await getDoc(adminRef);
        if (adminDoc.exists()) {
            const { Username, Password } = adminDoc.data(); // Extracting Username and Password
            if (usernameInput === Username && passwordInput === Password) {
                await resetAttempts();
                window.location.href = 'main/main.html';
            } else {
                let loginAttempts = attempts + 1;

                if (loginAttempts >= 5) {
                    await lockAccount(attemptsRef, passwordField, submitButton);
                } else {
                    await updateLoginAttempts(attemptsRef, loginAttempts);
                    showAttemptsWindow(loginAttempts); // Show attempts window only if attempts < 5
                    passwordField.value = '';
                    clearPasswordField(passwordField);
                    // Re-enable submit button after updating attempts
                    submitButton.disabled = false;
                }
            }
        } else {
            console.log("No such admin document!");
        }
    } catch (error) {
        console.error("Error fetching document: ", error);
        window.alert('Fehler beim Abrufen des Dokuments.');
    }
};


async function lockAccount(attemptsRef, passwordField, submitButton) {
    try {
        const now = new Date();
        const lockedUntil = new Date(now.getTime() + 10 * 60 * 1000);
        await updateDoc(attemptsRef, {
            attempts: 5,
            lockedUntil: lockedUntil
        });
        showLockWindow(lockedUntil); // Ensure lock window is shown
        passwordField.disabled = true;
        submitButton.disabled = true;
        locked = true;
        clearPasswordField(passwordField);

        // Start timer only if this is not the last attempt
        if (!locked) {
            startTimer(lockedUntil.toMillis());
        }
    } catch (error) {
        console.error('Fehler beim Sperren des Kontos: ', error);
    }
}

function startTimer(lockedUntilTime) {
    const remainingTime = lockedUntilTime - new Date().getTime();

    timer = setTimeout(async () => {
        const passwordField = document.getElementById('passwordInput');
        const submitButton = document.querySelector('.submit-button');
        passwordField.disabled = false;
        submitButton.disabled = false;
        passwordField.value = '';
        await resetAttempts();
        window.location.reload();
        locked = false;
        clearPasswordField(passwordField);
        removeLockWindow();
    }, remainingTime);
}

async function resetAttempts() {
    const ipAddress = await fetchIPAddress();
    const attemptsRef = doc(db, 'login', `${ipAddress}`);
    try {
        await updateDoc(attemptsRef, {
            attempts: 0,
            lockedUntil: deleteField()
        });
    } catch (error) {
        console.error('Fehler beim Zurücksetzen der Versuche: ', error);
    }
}

async function updateLoginAttempts(attemptsRef, loginAttempts) {
    try {
        await setDoc(attemptsRef, { attempts: loginAttempts }, { merge: true });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Anzahl der Versuche: ', error);
    }
}

async function fetchIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org/?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Fehler beim Abrufen der IP-Adresse: ', error);
        return null;
    }
}

function clearPasswordField(passwordField) {
    passwordField.value = '';
    passwordField.setAttribute('autocomplete', 'off');
    passwordField.setAttribute('autocorrect', 'off');
    passwordField.setAttribute('autocapitalize', 'off');
    passwordField.setAttribute('spellcheck', 'false');
}

function showBanWindow() {
    const banWindow = document.createElement('div');
    banWindow.style.position = 'fixed';
    banWindow.style.top = '0';
    banWindow.style.left = '0';
    banWindow.style.width = '100%';
    banWindow.style.height = '100%';
    banWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    banWindow.style.color = 'white';
    banWindow.style.display = 'flex';
    banWindow.style.justifyContent = 'center';
    banWindow.style.alignItems = 'center';
    banWindow.style.zIndex = '9999';

    const message = document.createElement('span');
    message.innerHTML = 'Dein Konto wurde <span style="color:turquoise">PERMANENT</span> gesperrt.';

    banWindow.appendChild(message);
    document.body.appendChild(banWindow);
}



function showAttemptsWindow(attempts) {
    const attemptsWindow = document.createElement('div');
    attemptsWindow.classList.add('attempts-window'); // Adding a class for easier selection later
    attemptsWindow.style.position = 'fixed';
    attemptsWindow.style.top = '0';
    attemptsWindow.style.left = '0';
    attemptsWindow.style.width = '100%';
    attemptsWindow.style.height = '100%';
    attemptsWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    attemptsWindow.style.color = 'white';
    attemptsWindow.style.display = 'flex';
    attemptsWindow.style.justifyContent = 'center';
    attemptsWindow.style.alignItems = 'center';
    attemptsWindow.style.zIndex = '9999';

    const message = document.createElement('span');
    message.innerHTML = `Falsches Passwort. Versuch ${attempts} von 5.`;

    attemptsWindow.appendChild(message);
    document.body.appendChild(attemptsWindow);

    // Automatically remove attempts window after 1.5 seconds
    setTimeout(() => {
        removeAttemptsWindow();
    }, 1500); // 1500 milliseconds = 1.5 seconds
}

function removeAttemptsWindow() {
    const attemptsWindow = document.querySelector('div.attempts-window');
    if (attemptsWindow) {
        document.body.removeChild(attemptsWindow);
    }
}

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

document.addEventListener('DOMContentLoaded', () => {
    const downloadButtons = document.querySelectorAll('.download-button');

    downloadButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const version = e.target.dataset.version;
            try {
                // Hier können Sie die Download-Logik implementieren
                const downloadUrl = await getDownloadUrl(version);
                window.location.href = downloadUrl;
            } catch (error) {
                console.error('Download fehlgeschlagen:', error);
                alert('Download fehlgeschlagen. Bitte versuchen Sie es später erneut.');
            }
        });
    });
});

async function getDownloadUrl(version) {
    // Hier können Sie die URLs für die verschiedenen Versionen definieren
    const downloads = {
        windows: 'path/to/windows/installer.exe',
        mac: 'path/to/mac/installer.dmg',
        linux: 'path/to/linux/installer.deb'
    };
    
    return downloads[version] || null;
}