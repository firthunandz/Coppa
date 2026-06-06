import sharp from 'sharp'

const sizes = [192, 512]
for (const size of sizes) {
  await sharp({
    create: {
      width: size, height: size,
      channels: 4,
      background: { r: 26, g: 26, b: 26, alpha: 1 }
    }
  })
  .composite([{
    input: await sharp('public/coppalogo.png')
      .resize(Math.round(size * 0.75), Math.round(size * 0.75), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer(),
    gravity: 'centre'
  }])
  .png()
  .toFile(`public/icon-${size}.png`)
}
console.log('Icons generated!')
