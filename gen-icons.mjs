import sharp from "sharp";
import { writeFileSync } from "fs";

// Exact broom paths from main.ts ICONS.broom
const broomPaths = `
  <path d="m13 11 9-9"/>
  <path d="M14.6 12.6c.8.8.9 2.1.2 3L10 22l-8-8 6.4-4.8c.9-.7 2.2-.6 3 .2Z"/>
  <path d="m6.8 10.4 6.8 6.8"/>
  <path d="m5 17 1.5 1.5"/>
`;

function makeSVG(size) {
  const pad = size * 0.18;
  const iconSize = size - pad * 2;
  const r = size * 0.22; // border radius

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <clipPath id="clip">
      <rect width="${size}" height="${size}" rx="${r}" ry="${r}"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>

  <!-- Broom icon, centered and scaled from 24x24 viewBox -->
  <g transform="translate(${pad}, ${pad}) scale(${iconSize / 24})"
     fill="none"
     stroke="white"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">
    ${broomPaths}
  </g>
</svg>`;
}

const sizes = [16, 48, 128];

for (const size of sizes) {
  const svg = makeSVG(size);
  const svgBuf = Buffer.from(svg);
  const pngBuf = await sharp(svgBuf).png().toBuffer();
  writeFileSync(`public/icons/${size}.png`, pngBuf);
  console.log(`✅ Saved ${size}x${size} icon`);
}
