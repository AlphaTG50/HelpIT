// Funktion zum Abrufen der neuesten Version von GitHub
async function updateFixITDownloadLink() {
    try {
        const response = await fetch('https://api.github.com/repos/HelpIT/FixIT/releases/latest');
        const data = await response.json();
        
        if (data.tag_name) {
            const version = data.tag_name.replace('v', '');
            const downloadLink = document.querySelector('.fixit-cta .cta-button');
            if (downloadLink) {
                downloadLink.href = `https://github.com/HelpIT/FixIT/releases/download/v${version}/FixIT.Setup.v${version}.exe`;
            }
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der FixIT Version:', error);
    }
}

// Führe die Funktion aus, wenn die Seite geladen ist
document.addEventListener('DOMContentLoaded', updateFixITDownloadLink); 