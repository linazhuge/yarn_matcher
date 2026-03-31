import { findClosestThread, findAlternatives, THREAD_COLORS_LAB } from "./colors";

const MAX_PIXELS = 250_000;

// Step 1: load image and extract raw pixel data
export function readImagePixels(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img;

      if (width * height > MAX_PIXELS) {
        URL.revokeObjectURL(url);
        reject(new Error(
          `Image too large (${width}×${height} = ${(width * height).toLocaleString()} pixels). Maximum is ${MAX_PIXELS.toLocaleString()} pixels.`
        ));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      resolve({ data: ctx.getImageData(0, 0, width, height).data, width, height });
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

// Step 2: build the pattern grid from raw pixels + stitch size + offset
export function buildPattern(pixels, stitchSize = 1, offsetLeft = 0, offsetTop = 0) {
  const { data, width, height } = pixels;

  const startX = Math.min(offsetLeft, width - 1);
  const startY = Math.min(offsetTop, height - 1);
  const availW = width - startX;
  const availH = height - startY;
  const gridW = Math.ceil(availW / stitchSize);
  const gridH = Math.ceil(availH / stitchSize);

  const threadNumberMap = new Map();
  let nextNumber = 1;
  const grid = [];

  for (let gy = 0; gy < gridH; gy++) {
    const row = [];
    for (let gx = 0; gx < gridW; gx++) {
      // Average all pixels in this stitch block
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dy = 0; dy < stitchSize; dy++) {
        for (let dx = 0; dx < stitchSize; dx++) {
          const px = startX + gx * stitchSize + dx;
          const py = startY + gy * stitchSize + dy;
          if (px >= width || py >= height) continue;
          const i = (py * width + px) * 4;
          const alpha = data[i + 3];
          rSum += alpha === 0 ? 255 : data[i];
          gSum += alpha === 0 ? 255 : data[i + 1];
          bSum += alpha === 0 ? 255 : data[i + 2];
          count++;
        }
      }
      const rgb = count > 0
        ? [Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)]
        : [255, 255, 255];

      const thread = findClosestThread(rgb);
      if (!threadNumberMap.has(thread.name)) {
        threadNumberMap.set(thread.name, nextNumber++);
      }
      row.push({ thread, number: threadNumberMap.get(thread.name) });
    }
    grid.push(row);
  }

  const countMap = new Map();
  for (const row of grid) {
    for (const cell of row) {
      countMap.set(cell.thread.name, (countMap.get(cell.thread.name) || 0) + 1);
    }
  }

  const legend = [...threadNumberMap.entries()]
    .map(([name, number]) => {
      const thread = THREAD_COLORS_LAB.find(t => t.name === name);
      return { number, thread, count: countMap.get(name), alternatives: findAlternatives(thread) };
    })
    .sort((a, b) => a.number - b.number);

  return { grid, legend };
}
