import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("assets", { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#10b981"/>
  <text x="512" y="660" font-family="system-ui,sans-serif" font-weight="700" font-size="520" fill="white" text-anchor="middle">P</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("assets/logo.png");
console.log("Wrote assets/logo.png");
