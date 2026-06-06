const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, fileName) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#d97757';
  ctx.font = `bold ${size * 0.6}px "Fraunces", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(fileName, buffer);
  console.log(`Created ${fileName}`);
}

createIcon(192, 'public/icon-192.png');
createIcon(512, 'public/icon-512.png');
