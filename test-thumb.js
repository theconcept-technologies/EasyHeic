const { app, nativeImage } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  try {
    // Find a HEIC file in the workspace or home directory if there's any
    const img = await nativeImage.createThumbnailFromPath('/Users/martin.laundl/Projects/theconcept_technologies/EasyHeic/resources/icon.png', { width: 400, height: 400 });
    console.log("Thumbnail size:", img.getSize());
  } catch (err) {
    console.error(err);
  }
  app.quit();
});
