# Yarn Matcher

**Live site: [yarnmatcher.vercel.app](https://yarnmatcher.vercel.app)**

A browser-based tool that converts pixel art images into embroidery thread patterns using DMC floss colors.

## Features

- Upload any pixel image and map every pixel to the closest DMC thread color using perceptual color matching (LAB color space)
- View the pattern as a numbered grid
- Legend showing DMC code, color name, and pixel count for each thread used
- Substitutes tab showing the 3 closest alternatives for each color, in case you don't have it

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## How it works

Pixel colors are converted from RGB to the CIE LAB color space, and matched to the closest DMC color using Delta-E distance. LAB matching is more perceptually accurate than plain RGB distance, meaning the matched colors look closer to the original.

## Thread colors

Thread colors are loaded from `src/lib/dmc.csv`. The CSV format is:

```
DMC_COLOR, COLOR_NAME, RGB_COLOR
315, Antique Mauve - MED DK, #7d4246
...
```

To use a different color list, replace the CSV with your own in the same format.
