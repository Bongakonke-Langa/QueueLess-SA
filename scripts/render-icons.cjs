const sharp = require('sharp');

const SVG_TICKET = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'>` +
`<rect width='512' height='512' rx='112' fill='#0e3b32'/>` +
`<rect x='96' y='150' width='320' height='212' rx='28' fill='none' stroke='#e5b641' stroke-width='26'/>` +
`<line x1='168' y1='150' x2='168' y2='110' stroke='#e5b641' stroke-width='26' stroke-linecap='round'/>` +
`<line x1='344' y1='150' x2='344' y2='110' stroke='#e5b641' stroke-width='26' stroke-linecap='round'/>` +
`<line x1='176' y1='236' x2='336' y2='236' stroke='#e5b641' stroke-width='22' stroke-linecap='round' stroke-dasharray='4 26'/>` +
`<circle cx='256' cy='302' r='26' fill='#e5b641'/>` +
`</svg>`;

(async () => {
  await sharp(Buffer.from(SVG_TICKET, 'utf8')).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(Buffer.from(SVG_TICKET, 'utf8')).resize(32, 32).png().toFile('public/favicon-32.png');
  await sharp(Buffer.from(SVG_TICKET, 'utf8')).resize(512, 512).png().toFile('public/icon-512.png');
  console.log('icons rendered');
})().catch(e => { console.error(e.message); process.exit(1); });
