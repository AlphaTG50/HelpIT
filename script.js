// Funktion um den neusten Release von einem Github Repository herunterzuladen
async function downloadLatestRelease(owner, repo) {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

    const response = await fetch(apiUrl);
    const releaseData = await response.json();

    if (response.ok) {
      const assetUrl = releaseData.assets[0].browser_download_url;

      // Erstellen Sie ein unsichtbares iFrame-Element, um den Download zu initiieren
      const downloadFrame = document.createElement("iframe");
      downloadFrame.style.display = "none";
      downloadFrame.src = assetUrl;
      document.body.appendChild(downloadFrame);

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