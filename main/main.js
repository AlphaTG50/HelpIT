// Am Anfang der Datei hinzufügen
function checkAuth() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.replace('../index.html');
    }
}

// Beim Laden der Seite Auth überprüfen
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadGitHubReleases();
    
    // Füge Scroll-Event-Listener hinzu
    const slider = document.getElementById('versionSlider');
    slider.addEventListener('scroll', () => updateSliderButtons(slider));
    
    // Theme aus localStorage laden
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
});

// Logout-Funktion aktualisieren
window.logout = function() {
    localStorage.removeItem('userLoggedIn');
    window.location.replace('../index.html');
};

// Funktion um den neusten Release von einem Github Repository herunterzuladen
async function downloadLatestRelease(owner, repo) {
  try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      const response = await fetch(apiUrl);
      const releaseData = await response.json();

      if (response.ok) {
          if (releaseData.assets && releaseData.assets.length > 0) {
              // Suche nach der .exe Datei
              const downloadAsset = releaseData.assets.find(asset => asset.name.endsWith('.exe'));
              
              if (downloadAsset) {
                  // Direkter Download der .exe Datei
                  window.location.href = downloadAsset.browser_download_url;
                  console.log(`Download gestartet: ${downloadAsset.name}`);
              } else {
                  alert('Keine Windows-Version (.exe) in diesem Release gefunden.');
              }
          } else {
              alert('Keine Downloads in diesem Release verfügbar.');
          }
      } else {
          alert(`Fehler beim Abrufen des Releases: ${releaseData.message}`);
      }
  } catch (error) {
      console.error(`Fehler: ${error.message}`);
      alert('Fehler beim Download. Bitte versuchen Sie es später erneut.');
  }
}

  
  
  // Funktion um den neusten Release von einem Github Repository herunterzuladen mit Password
  async function downloadLatestReleasewithPassword(owner, repo) {
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  
      const response = await fetch(apiUrl);
      const releaseData = await response.json();
  
      if (response.ok) {
        const assetUrl = releaseData.assets[0].browser_download_url;
  
        // Hier wird die promptForPasswordAndDownload-Funktion aufgerufen
        promptForPasswordAndDownload(assetUrl);
  
        console.log(`Neuestes Release von ${repo} heruntergeladen: ${assetUrl}`);
      } else {
        console.error(
          `Fehler beim Abrufen des neuesten Releases von ${repo}: ${releaseData.message}`
        );
      }
    } catch (error) {
      console.error(`Fehler: ${error.message}`);
    }
  }

// Aktualisiere die loadGitHubReleases Funktion
async function loadGitHubReleases() {
    try {
        const headers = new Headers({
            'Accept': 'application/vnd.github.v3+json'
        });

        const response = await fetch('https://api.github.com/repos/alphatg50/fixit/releases', { headers });
        const releases = await response.json();
        
        if (!releases || releases.length === 0) {
            console.log('Keine Releases gefunden');
            return;
        }

        // Neueste Version anzeigen
        const latestRelease = releases[0];
        const latestExeAsset = latestRelease.assets.find(asset => asset.name.endsWith('.exe'));
        
        if (latestExeAsset) {
            const latestVersionCard = document.getElementById('latestVersionCard');
            const latestDate = new Date(latestRelease.published_at).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            // Bereinige die Release Notes und behalte Zeilenumbrüche
            const cleanReleaseNotes = latestRelease.body
                ? latestRelease.body
                    .replace(/[_*~`]/g, '') // Entfernt Markdown-Formatierungszeichen
                    .replace(/\r\n|\n|\r/g, '<br>') // Ersetzt alle Arten von Zeilenumbrüchen mit <br>
                : '';
            
            latestVersionCard.innerHTML = `
                <div class="latest-version-info">
                    Version ${latestRelease.tag_name}
                    <br>
                    Veröffentlicht: ${latestDate}
                    <br>
                    Größe: ${(latestExeAsset.size / 1048576).toFixed(2)} MB
                    ${cleanReleaseNotes ? `
                        <div class="latest-version-notes-container">
                            <div class="latest-version-notes collapsed">${cleanReleaseNotes}</div>
                            <button class="toggle-notes" onclick="toggleNotes(this)">Mehr anzeigen ▼</button>
                        </div>
                    ` : ''}
                </div>
                <button class="download-button" onclick="window.location.href='${latestExeAsset.browser_download_url}'">
                    Jetzt Herunterladen
                </button>
            `;
        }

        // Ältere Versionen anzeigen
        const slider = document.getElementById('versionSlider');
        const olderReleases = releases.slice(1); // Alle außer der neuesten Version

        olderReleases.forEach(release => {
            const exeAsset = release.assets.find(asset => asset.name.endsWith('.exe'));
            if (exeAsset) {
                const card = document.createElement('div');
                card.className = 'version-card';
                
                const date = new Date(release.published_at).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });

                // Bereinige die Release Notes und behalte Zeilenumbrüche
                const cleanDescription = release.body 
                    ? release.body
                        .replace(/[_*~`]/g, '') // Entfernt Markdown-Formatierungszeichen
                        .replace(/\r\n|\n|\r/g, '<br>') // Ersetzt alle Arten von Zeilenumbrüchen mit <br>
                    : 'Keine Beschreibung verfügbar';
                
                card.innerHTML = `
                    <h3>Version ${release.tag_name}</h3>
                    <div class="version-date">Veröffentlicht: ${date}</div>
                    <div class="version-description">${cleanDescription}</div>
                    <button class="download-button" onclick="window.location.href='${exeAsset.browser_download_url}'">
                        Download ${release.tag_name}
                        <br>
                        <small>(${(exeAsset.size / 1048576).toFixed(2)} MB)</small>
                    </button>
                `;
                
                slider.appendChild(card);
            }
        });

        // Slider-Buttons nur anzeigen, wenn es mehr als eine ältere Version gibt
        const buttons = document.querySelectorAll('.slider-button');
        buttons.forEach(button => {
            button.style.display = olderReleases.length > 1 ? 'block' : 'none';
        });

    } catch (error) {
        console.error('Fehler beim Laden der Releases:', error);
        const slider = document.getElementById('versionSlider');
        slider.innerHTML = '<div class="error-message">Fehler beim Laden der Versionen. Bitte versuchen Sie es später erneut.</div>';
    }
}

// Verbesserte slideVersions Funktion
function slideVersions(direction) {
    const slider = document.getElementById('versionSlider');
    const cardWidth = 300; // Breite einer Karte inkl. Margin
    
    if (direction === 'left') {
        slider.scrollLeft -= cardWidth;
    } else {
        slider.scrollLeft += cardWidth;
    }

    // Überprüfe, ob Scroll-Buttons angezeigt werden sollen
    updateSliderButtons(slider);
}

// Neue Funktion zum Aktualisieren der Slider-Buttons
function updateSliderButtons(slider) {
    const prevButton = document.querySelector('.slider-button.prev');
    const nextButton = document.querySelector('.slider-button.next');
    
    if (prevButton && nextButton) {
        prevButton.style.opacity = slider.scrollLeft <= 0 ? '0.5' : '1';
        nextButton.style.opacity = 
            (slider.scrollLeft + slider.clientWidth) >= slider.scrollWidth ? '0.5' : '1';
    }
}

// Füge diese neue Funktion hinzu
function toggleNotes(button) {
    const notesElement = button.previousElementSibling;
    const isCollapsed = notesElement.classList.contains('collapsed');
    
    notesElement.classList.toggle('collapsed');
    button.textContent = isCollapsed ? 'Weniger anzeigen ▲' : 'Mehr anzeigen ▼';
}

// Füge die toggleNotes Funktion zum globalen Scope hinzu
window.toggleNotes = toggleNotes;

// Füge diese Funktionen am Ende der Datei hinzu
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme(event) {
    event.preventDefault();
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Füge die toggleTheme Funktion zum globalen Scope hinzu
window.toggleTheme = toggleTheme;