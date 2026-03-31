import { findClosestThread, findAlternatives, THREAD_COLORS_LAB } from "./colors";

export function processImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const { data } = ctx.getImageData(0, 0, width, height);
      const threadNumberMap = new Map();
      let nextNumber = 1;
      const grid = [];

      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const alpha = data[i + 3];
          const rgb = alpha === 0 ? [255, 255, 255] : [data[i], data[i + 1], data[i + 2]];
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
          return {
            number,
            thread,
            count: countMap.get(name),
            alternatives: findAlternatives(thread),
          };
        })
        .sort((a, b) => a.number - b.number);

      resolve({ grid, legend });
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
