const sharp = require('sharp');

const SVG_MASKABLE = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>` +
`<rect width='512' height='512' rx='112' fill='#0e3b32'/>` +
`<rect x='156' y='170' width='200' height='172' rx='22' fill='none' stroke='#e5b641' stroke-width='22'/>` +
`<line x1='200' y1='170' x2='200' y2='138' stroke='#e5b641' stroke-width='22' stroke-linecap='round'/>` +
`<line x1='312' y1='170' x2='312' y2='138' stroke='#e5b641' stroke-width='22' stroke-linecap='round'/>` +
`<line x1='208' y1='242' x2='304' y2='242' stroke='#e5b641' stroke-width='18' stroke-linecap='round' stroke-dasharray='3 22'/>` +
`<circle cx='256' cy='278' r='22' fill='#e5b641'/>` +
`</svg>`;

(async () => {
  await sharp(Buffer.from(SVG_MASKABLE, 'utf8'))
    .resize(512, 512, { fit: 'cover', background: { r:14, g:59, b:50, alpha:255 } })
    .png()
    .toFile('public/icon-maskable.png');
  console.log('maskable icon rendered');
})().catch(e => { console.error(e.message); process.exit(1); });
