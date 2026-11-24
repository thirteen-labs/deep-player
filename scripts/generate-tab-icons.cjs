/**
 * Generates the small monochrome tab icons used by NativeTabs on Android.
 * Bundled PNGs avoid loading the Material Symbols font through expo-symbols,
 * which cannot resolve its font asset in Expo Go.
 *
 * Run with: node scripts/generate-tab-icons.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'tabs');
const LOGICAL = 24;
const SCALE = 6;
const OUTPUT_SCALE = 3;
const SIZE = LOGICAL * SCALE;
const OUTPUT_SIZE = LOGICAL * OUTPUT_SCALE;
const DOWNSAMPLE = SCALE / OUTPUT_SCALE;

function createCanvas() {
  const png = new PNG({ width: SIZE, height: SIZE });
  png.data.fill(0);
  return png;
}

function blend(png, x, y, alpha) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  const next = Math.min(255, (png.data[i + 3] || 0) + alpha);
  png.data[i] = 255;
  png.data[i + 1] = 255;
  png.data[i + 2] = 255;
  png.data[i + 3] = next;
}

function drawPoint(png, x, y, coverage = 1) {
  blend(png, Math.round(x), Math.round(y), Math.round(255 * coverage));
}

function drawLine(png, x1, y1, x2, y2, width = 2) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * SCALE * 2);
  const half = (width * SCALE) / 2;
  for (let s = 0; s <= steps; s += 1) {
    const t = s / steps;
    const cx = (x1 + (x2 - x1) * t) * SCALE;
    const cy = (y1 + (y2 - y1) * t) * SCALE;
    const minX = Math.floor(cx - half - 1);
    const maxX = Math.ceil(cx + half + 1);
    const minY = Math.floor(cy - half - 1);
    const maxY = Math.ceil(cy + half + 1);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (d <= half) blend(png, x, y, 255);
      }
    }
  }
}

function drawPolyline(png, points, width = 2) {
  for (let i = 1; i < points.length; i += 1) {
    drawLine(png, points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], width);
  }
}

function insidePolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function fillPolygon(png, points) {
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (insidePolygon((x + 0.5) / SCALE, (y + 0.5) / SCALE, points)) {
        blend(png, x, y, 255);
      }
    }
  }
}

function strokePolygon(png, points, width = 2) {
  drawPolyline(png, [...points, points[0]], width);
}

function drawCircle(png, cx, cy, r, width = 2, filled = false) {
  const steps = Math.ceil(r * SCALE * 16);
  for (let s = 0; s < steps; s += 1) {
    const angle = (s / steps) * Math.PI * 2;
    const x = (cx + Math.cos(angle) * r) * SCALE;
    const y = (cy + Math.sin(angle) * r) * SCALE;
    if (filled) {
      for (let dy = -r * SCALE; dy <= r * SCALE; dy += 1) {
        for (let dx = -r * SCALE; dx <= r * SCALE; dx += 1) {
          if (Math.hypot(dx, dy) <= r * SCALE) blend(png, Math.round(x + dx), Math.round(y + dy), 255);
        }
      }
      return;
    }
    drawPoint(png, x, y);
  }
  if (!filled) {
    const half = (width * SCALE) / 2;
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const d = Math.abs(Math.hypot(x + 0.5 - cx * SCALE, y + 0.5 - cy * SCALE) - r * SCALE);
        if (d <= half) blend(png, x, y, 255);
      }
    }
  }
}

function downsample(png) {
  const out = new PNG({ width: OUTPUT_SIZE, height: OUTPUT_SIZE });
  out.data.fill(0);
  for (let y = 0; y < OUTPUT_SIZE; y += 1) {
    for (let x = 0; x < OUTPUT_SIZE; x += 1) {
      let sum = 0;
      for (let sy = 0; sy < DOWNSAMPLE; sy += 1) {
        for (let sx = 0; sx < DOWNSAMPLE; sx += 1) {
          sum += png.data[((y * DOWNSAMPLE + sy) * SIZE + (x * DOWNSAMPLE + sx)) * 4 + 3];
        }
      }
      const i = (y * OUTPUT_SIZE + x) * 4;
      out.data[i] = 255;
      out.data[i + 1] = 255;
      out.data[i + 2] = 255;
      out.data[i + 3] = Math.round(sum / (DOWNSAMPLE * DOWNSAMPLE));
    }
  }
  return out;
}

function save(name, draw) {
  const high = createCanvas();
  draw(high);
  const out = downsample(high);
  fs.writeFileSync(path.join(OUT_DIR, `${name}.png`), PNG.sync.write(out));
}

fs.mkdirSync(OUT_DIR, { recursive: true });

save('home', (p) => {
  drawPolyline(p, [[2.5, 11], [12, 2.5], [21.5, 11]]);
  drawPolyline(p, [[5.5, 9.5], [5.5, 21], [18.5, 21], [18.5, 9.5]]);
});
save('home-filled', (p) => {
  fillPolygon(p, [[2, 11.5], [12, 2], [22, 11.5], [22, 21.5], [2, 21.5]]);
});
save('folder', (p) => {
  strokePolygon(p, [[2.5, 6], [9, 6], [11, 8.2], [21.5, 8.2], [21.5, 19], [2.5, 19]]);
});
save('folder-open', (p) => {
  fillPolygon(p, [[2, 8], [10, 8], [12.5, 10.5], [22, 10.5], [19.5, 20.5], [2, 20.5]]);
});
save('music', (p) => {
  drawCircle(p, 6, 18, 2.6, 2);
  drawCircle(p, 16, 16, 2.6, 2);
  drawPolyline(p, [[8.6, 18], [8.6, 5], [18.6, 3], [18.6, 16]]);
});
save('music-filled', (p) => {
  drawCircle(p, 6, 18, 2.8, 2, true);
  drawCircle(p, 16, 16, 2.8, 2, true);
  drawLine(p, 8.2, 18, 8.2, 4, 2.4);
  drawLine(p, 8.2, 4, 18.4, 1.8, 2.4);
  drawLine(p, 18.4, 1.8, 18.4, 16, 2.4);
});
save('videocam', (p) => {
  strokePolygon(p, [[2.5, 6], [16, 6], [16, 18], [2.5, 18]]);
  drawPolyline(p, [[16, 10], [21.5, 6.5], [21.5, 17.5], [16, 14]]);
});
save('videocam-filled', (p) => {
  fillPolygon(p, [[2, 6], [16, 6], [16, 18], [2, 18]]);
  fillPolygon(p, [[16, 9.5], [22, 6], [22, 18], [16, 14.5]]);
});
save('person', (p) => {
  drawCircle(p, 12, 7.5, 3.7, 2);
  drawPolyline(p, [[3.5, 21], [5.2, 16.5], [8.5, 13.8], [12, 13], [15.5, 13.8], [18.8, 16.5], [20.5, 21]]);
});
save('person-filled', (p) => {
  drawCircle(p, 12, 7, 4, 2, true);
  fillPolygon(p, [[3, 22], [4.5, 16.5], [8, 13.5], [12, 12.5], [16, 13.5], [19.5, 16.5], [21, 22]]);
});

console.log(`Wrote tab icons to ${OUT_DIR}`);
