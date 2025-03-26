import { loadTokenFromFirebase } from '../firebase-config.js';

const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);


async function fetchLatestVersion(token) {
  try {
    const response = await fetch('https://api.github.com/repos/AlphaTG50/FixIT/releases/latest', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`HTTP Fehler: ${response.status}`);

    const data = await response.json();
    document.getElementById('systemStatusText').textContent = `Version ${data.tag_name}`;
    
    const releaseDate = new Date(data.published_at).toLocaleDateString('de-DE', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    document.getElementById('releaseDate').textContent = releaseDate;
    document.getElementById('systemStatus').className = 'status-indicator online';
  } catch (error) {
    console.error('Fehler beim Abrufen der Version:', error);
    document.getElementById('systemStatusText').textContent = 'Version konnte nicht geladen werden';
    document.getElementById('releaseDate').textContent = 'Datum konnte nicht geladen werden';
    document.getElementById('systemStatus').className = 'status-indicator error';
  }
}

async function fetchChangelogs(token) {
  try {
    const response = await fetch('https://api.github.com/repos/AlphaTG50/FixIT/releases', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Netzwerk-Antwort war nicht ok');

    const releases = await response.json();
    const changelogContainer = document.getElementById('changelogContainer');
    changelogContainer.innerHTML = '';

    releases.forEach(release => {
      const releaseDate = new Date(release.published_at).toLocaleDateString('de-DE', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const downloadUrl = `https://github.com/AlphaTG50/FixIT/releases/download/${release.tag_name}/FixIT.Setup.${release.tag_name}.exe`;
      const formattedBody = release.body ? marked.parse(release.body) : 'Keine Beschreibung verfügbar.';

      const versionEntry = document.createElement('div');
      versionEntry.className = 'version-entry';
      versionEntry.innerHTML = `
        <div class="version-header">
          <div class="version-info">
            <span class="version-tag">${release.tag_name}</span>
            <h2>${release.name || 'Release ' + release.tag_name}</h2>
            <span class="status-tag">${releaseDate}</span>
          </div>
          <a href="${downloadUrl}" class="download-button" target="_blank">Download</a>
        </div>
        <div class="version-description">${formattedBody}</div>
      `;
      changelogContainer.appendChild(versionEntry);
    });
  } catch (err) {
    console.error('Fehler beim Abrufen der Changelogs:', err);
    document.getElementById('changelogContainer').innerHTML = `
      <div class="error-message">
        <p>Changelogs konnten nicht geladen werden.</p>
        <p class="error-details">Fehler: ${err.message}</p>
      </div>`;
  }
}

// Starte alles nach DOM load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = await loadTokenFromFirebase();
    if (document.getElementById('systemStatusText')) {
      fetchLatestVersion(token);
    }
    if (window.location.pathname.includes('changelog')) {
      fetchChangelogs(token);
    }
  } catch (err) {
    console.error('Token konnte nicht geladen werden:', err);
  }
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }
  
  window.toggleTheme = toggleTheme; // ← DAS MACHT ES SICHTBAR
  
  function logout() {
    // Browser-Verlauf komplett löschen
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, '', window.location.href);
    };
    
    // Alle Verlaufsdaten löschen
    window.history.replaceState(null, '', '../../index.html');
    
    // Zur Login-Seite weiterleiten und Verlauf ersetzen
    window.location.replace('../../index.html');
  }

  // Funktion global verfügbar machen
  window.logout = logout;
  
  
  