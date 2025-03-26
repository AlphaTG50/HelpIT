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
                
                if (releases.length === 0) {
                    changelogContainer.innerHTML = '<p>Keine Releases verfügbar.</p>';
                    return;
                }

                releases.forEach(release => {
                    const releaseDate = new Date(release.published_at);
                    const formattedDate = releaseDate.toLocaleDateString('de-DE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });

                    // Korrigierte Download-URL mit "v" im Dateinamen
                    const downloadUrl = `https://github.com/AlphaTG50/FixIT/releases/download/${release.tag_name}/FixIT.Setup.${release.tag_name}.exe`;
                    // Jetzt wird z.B.: https://github.com/AlphaTG50/FixIT/releases/download/v1.0.0/FixIT.Setup.v1.0.0.exe

                    // Erst Markdown parsen
                    let formattedBody = release.body ? marked.parse(release.body) : 'Keine Beschreibung verfügbar.';
                    
                    // Bereinige den Text
                    formattedBody = formattedBody
                        .split('\n')
                        .map(line => {
                            line = line.trim();
                            // Ignoriere leere Zeilen
                            if (!line) return '';
                            // Behalte Überschriften unverändert
                            if (line.startsWith('<h')) return line;
                            // Behandle "Erstveröffentlichung" speziell
                            if (line === 'Erstveröffentlichung') return line;
                            
                            // Behandle existierende Aufzählungspunkte und Bindestriche
                            if (line.startsWith('•') || line.startsWith('-')) {
                                // Teile die Zeile an vorhandenen Aufzählungspunkten
                                const items = line.split(/[•-]\s+/).filter(item => item);
                                return items.map(item => '• ' + item.trim() + '<br>').join('\n');
                            }
                            
                            // Andere Zeilen bleiben unverändert
                            return line;
                        })
                        .filter(line => line) // Entferne leere Zeilen
                        .join('\n');

                    const versionEntry = document.createElement('div');
                    versionEntry.className = 'version-entry';
                    versionEntry.innerHTML = `
                        <div class="version-header">
                            <div class="version-info">
                                <span class="version-tag">${release.tag_name}</span>
                                <h2>${release.name || 'Release ' + release.tag_name}</h2>
                                <span class="status-tag">${formattedDate}</span>
                            </div>
                            <a href="${downloadUrl}" class="download-button" target="_blank">
                                <svg class="download-icon" viewBox="0 0 24 24">
                                    <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/>
                                </svg>
                            </a>
                        </div>
                        <div class="version-description">
                            ${formattedBody}
                        </div>
                    `;
                    changelogContainer.appendChild(versionEntry);
                });
            } catch (error) {
                console.error('Fehler beim Abrufen der Changelogs:', error);
                const errorMessage = error.message || 'Unbekannter Fehler';
                document.getElementById('changelogContainer').innerHTML = 
                    `<div class="error-message">
                        <p>Changelogs konnten nicht geladen werden.</p>
                        <p class="error-details">Fehler: ${errorMessage}</p>
                    </div>`;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            fetchChangelogs();
        });