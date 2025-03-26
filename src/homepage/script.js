function toggleTheme() {
    const body = document.body;
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
    } else {
        body.setAttribute('data-theme', 'light');
    }
}

async function fetchLatestVersion() {
    try {
        const response = await fetch('https://api.github.com/repos/AlphaTG50/FixIT/releases/latest', {
            headers: {
                'Authorization': `Bearer ${window.TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Version aktualisieren
        const versionElement = document.getElementById('systemStatusText');
        versionElement.textContent = `Version ${data.tag_name}`;
        
        // Datum aktualisieren
        const releaseDate = new Date(data.published_at);
        const formattedDate = releaseDate.toLocaleDateString('de-DE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        document.getElementById('releaseDate').textContent = formattedDate;
        
        // Status-Indikatoren aktualisieren
        document.getElementById('systemStatus').className = 'status-indicator online';
        
    } catch (error) {
        console.error('Fehler beim Abrufen der Version:', error);
        
        // Fehlermeldungen anzeigen
        document.getElementById('systemStatusText').textContent = 'Version konnte nicht geladen werden';
        document.getElementById('releaseDate').textContent = 'Datum konnte nicht geladen werden';
        
        // Status-Indikator auf Fehler setzen
        document.getElementById('systemStatus').className = 'status-indicator error';
    }
}

async function fetchChangelogs() {
    try {
        const response = await fetch('https://api.github.com/repos/AlphaTG50/FixIT/releases', {
            headers: {
                'Authorization': `Bearer ${window.TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Netzwerk-Antwort war nicht ok');
        }
        
        const releases = await response.json();
        const changelogContainer = document.getElementById('changelogContainer');
        
        releases.forEach(release => {
            const releaseDate = new Date(release.published_at);
            const formattedDate = releaseDate.toLocaleDateString('de-DE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const versionEntry = document.createElement('div');
            versionEntry.className = 'version-entry';
            versionEntry.innerHTML = `
                <div class="version-header">
                    <span class="version-tag">${release.tag_name}</span>
                    <h2>${release.name || 'Release ' + release.tag_name}</h2>
                    <span class="status-tag">${formattedDate}</span>
                </div>
                <p class="version-description">${release.body || 'Keine Beschreibung verfügbar.'}</p>
            `;
            changelogContainer.appendChild(versionEntry);
        });
    } catch (error) {
        console.error('Fehler beim Abrufen der Changelogs:', error);
        document.getElementById('changelogContainer').innerHTML = '<p>Changelogs konnten nicht geladen werden.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLatestVersion();
    
    if (window.location.pathname.includes('changelog.html')) {
        fetchChangelogs();
    }
});

// Am Anfang des Scripts
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

