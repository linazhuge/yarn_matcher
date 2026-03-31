import rawCsv from "./dmc.csv?raw";

function hexToRgb(hex) {
  const clean = hex.trim();
  return [
    parseInt(clean.slice(1, 3), 16),
    parseInt(clean.slice(3, 5), 16),
    parseInt(clean.slice(5, 7), 16),
  ];
}

function parseCsv(raw) {
  const lines = raw.trim().split("\n").slice(1); // skip header
  return lines
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 3) return null;
      const code = parts[0];
      const colorName = parts[1];
      const hex = parts[parts.length - 1];
      if (!hex.startsWith("#")) return null;
      return { code, name: colorName, rgb: hexToRgb(hex) };
    })
    .filter(Boolean);
}

export const THREAD_COLORS = parseCsv(rawCsv);

function toLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToLab([r, g, b]) {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  let x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  let y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  let z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  x /= 0.95047;
  y /= 1.00000;
  z /= 1.08883;

  function f(t) {
    return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  }

  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE([l1, a1, b1], [l2, a2, b2]) {
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

export const THREAD_COLORS_LAB = THREAD_COLORS.map((color) => ({
  ...color,
  lab: rgbToLab(color.rgb),
}));

export function findClosestThread(rgb) {
  const lab = rgbToLab(rgb);
  let best = null;
  let bestDist = Infinity;

  for (const thread of THREAD_COLORS_LAB) {
    const dist = deltaE(lab, thread.lab);
    if (dist < bestDist) {
      bestDist = dist;
      best = thread;
    }
  }

  return best;
}

// Returns the n closest threads to a given thread (excluding itself)
export function findAlternatives(thread, n = 3) {
  return THREAD_COLORS_LAB
    .filter((t) => t.name !== thread.name)
    .map((t) => ({ thread: t, dist: deltaE(thread.lab, t.lab) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n)
    .map((e) => e.thread);
}
