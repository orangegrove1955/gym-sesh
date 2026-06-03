// Generate simple SVG-based PNG icons for PWA
const fs = require('fs');

function createSvgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0a0a0a"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="${size * 0.35}" fill="#3b82f6">GS</text>
  <text x="50%" y="78%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size * 0.1}" fill="#888">GYMSESH</text>
</svg>`;
}

// Write SVG icons (browsers accept SVG for manifest icons too, but let's keep as SVG and also reference them)
fs.writeFileSync('icon-192.svg', createSvgIcon(192));
fs.writeFileSync('icon-512.svg', createSvgIcon(512));
console.log('Generated icon SVGs');
