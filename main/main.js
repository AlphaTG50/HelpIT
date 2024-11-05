// Funktion um den neusten Release von einem Github Repository herunterzuladen
async function downloadLatestRelease(owner, repo) {
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
      const response = await fetch(apiUrl);
      const releaseData = await response.json();
  
      // Log the entire release data to check its structure
      console.log("Release Data:", releaseData);
  
      if (response.ok) {
        if (releaseData.assets && releaseData.assets.length > 0) {
          const assetUrl = releaseData.assets[0].browser_download_url;
  
          // Create an invisible iFrame to initiate the download
          const downloadFrame = document.createElement("iframe");
          downloadFrame.style.display = "none";
          downloadFrame.src = assetUrl;
          document.body.appendChild(downloadFrame);
  
          console.log(`Latest release of ${repo} downloaded: ${assetUrl}`);
        } else {
          console.error(`No downloadable assets found for the latest release of ${repo}.`);
        }
      } else {
        console.error(`Error fetching the latest release of ${repo}: ${releaseData.message}`);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
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