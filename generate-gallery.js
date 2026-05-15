/**
 * generate-gallery.js
 * 
 * Dieses Node.js-Skript scannt den Ordner 'galerie' nach Bildern 
 * und generiert automatisch die 'galerie.json'.
 * Ausführung: node generate-gallery.js
 */
const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, 'galerie');
const outputFile = path.join(__dirname, 'galerie.json');

try {
    if (!fs.existsSync(galleryDir)) {
        console.error('Ordner "galerie" nicht gefunden.');
        process.exit(1);
    }

    const files = fs.readdirSync(galleryDir);
    const images = files
        .filter(file => /\.(webp|jpg|jpeg|png|gif)$/i.test(file))
        .map(file => ({
            src: `galerie/${file}`,
            alt: "Cluster V Galeriebild"
        }));

    fs.writeFileSync(outputFile, JSON.stringify(images, null, 2));
    console.log(`Erfolg: ${images.length} Bilder in galerie.json eingetragen.`);
} catch (err) {
    console.error('Fehler:', err);
    process.exit(1);
}