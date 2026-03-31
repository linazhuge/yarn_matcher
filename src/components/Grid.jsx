import { useRef, useEffect, useCallback } from "react";
import styles from "./Grid.module.css";

const BASE = 14;
const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

function drawGrid(canvas, grid, cellSize) {
  const W = grid[0].length;
  const H = grid.length;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = W * cellSize * dpr;
  canvas.height = H * cellSize * dpr;
  canvas.style.width = `${W * cellSize}px`;
  canvas.style.height = `${H * cellSize}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cell = grid[y][x];
      const [r, g, b] = cell.thread.rgb;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

      if (cellSize >= 8) {
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        ctx.fillStyle = brightness > 140 ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.65)";
        ctx.font = `${Math.floor(cellSize * 0.5)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(cell.number), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
      }
    }
  }

  if (cellSize >= 4) {
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, H * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(W * cellSize, y * cellSize);
      ctx.stroke();
    }
  }
}

export default function Grid({ grid, scale = 1, onScaleChange }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const pan = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(scale);

  // Keep scaleRef in sync with prop
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  function applyPan() {
    const { x, y } = pan.current;
    canvasRef.current.style.transform = `translate(${x}px, ${y}px)`;
  }

  // Redraw whenever grid or scale changes
  useEffect(() => {
    if (!grid.length) return;
    const cellSize = Math.max(1, Math.round(BASE * scale));
    drawGrid(canvasRef.current, grid, cellSize);
    applyPan();
  }, [grid, scale]);

  // Reset pan on new image
  useEffect(() => {
    pan.current = { x: 0, y: 0 };
  }, [grid]);

  // Scroll to zoom toward cursor
  useEffect(() => {
    const wrapper = wrapperRef.current;

    function onWheel(e) {
      e.preventDefault();
      const oldScale = scaleRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale * factor));
      if (newScale === oldScale) return;

      // Zoom toward cursor: keep the point under the cursor fixed
      const rect = wrapper.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const ratio = newScale / oldScale;
      pan.current.x = cursorX - (cursorX - pan.current.x) * ratio;
      pan.current.y = cursorY - (cursorY - pan.current.y) * ratio;

      onScaleChange(newScale);
    }

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", onWheel);
  }, [onScaleChange]);

  // Drag to pan
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const startX = e.clientX - pan.current.x;
    const startY = e.clientY - pan.current.y;

    function onMove(e) {
      pan.current.x = e.clientX - startX;
      pan.current.y = e.clientY - startY;
      canvasRef.current.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px)`;
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrapper} onMouseDown={onMouseDown}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ transformOrigin: "top left" }}
      />
    </div>
  );
}
