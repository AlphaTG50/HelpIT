// ✅ Nur EINZIGER Import nötig:
import { loadTokenFromFirebase } from '../firebase-config.js';


async function fetchChangelogs(token) {
    try {
        const response = await fetch('https://api.github.com/repos/AlphaTG50/FixIT/releases', {
            headers: {
                'Authorization': `Bearer ${token}`
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

            const downloadUrl = `https://github.com/AlphaTG50/FixIT/releases/download/${release.tag_name}/FixIT.Setup.${release.tag_name}.exe`;

            let formattedBody = release.body ? marked.parse(release.body) : 'Keine Beschreibung verfügbar.';
            formattedBody = formattedBody.split('\n')
                .map(line => {
                    line = line.trim();
                    if (!line) return '';
                    if (line.startsWith('<h')) return line;
                    if (line === 'Erstveröffentlichung') return line;
                    if (line.startsWith('•') || line.startsWith('-')) {
                        const items = line.split(/[•-]\s+/).filter(item => item);
                        return items.map(item => '• ' + item.trim() + '<br>').join('\n');
                    }
                    return line;
                }).filter(line => line).join('\n');

            const versionEntry = document.createElement('div');
            versionEntry.className = 'version-entry';
            versionEntry.innerHTML = `
                <div class="version-header">
                    <div class="version-info">
                        <span class="version-tag">${release.tag_name}</span>
                        <h2>${release.name || 'Release ' + release.tag_name}</h2>
                        <span class="status-tag">${formattedDate}</span>
                    </div>
                    <a href="${downloadUrl}" class="download-button" target="_blank" aria-label="Download">
                        <svg class="download-icon" viewBox="0 0 24 24">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
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
        document.getElementById('changelogContainer').innerHTML =
            `<div class="error-message">
                <p>Changelogs konnten nicht geladen werden.</p>
                <p class="error-details">Fehler: ${error.message}</p>
            </div>`;
    }
}

// Start erst nach DOM + Token
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = await loadTokenFromFirebase();

        await fetchChangelogs(token);
    } catch (err) {
        console.error('Fehler beim Laden des Tokens:', err);
    }
});
