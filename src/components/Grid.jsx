import styles from "./Grid.module.css";

export default function Grid({ grid }) {
  const cellSize = 14;
  const width = grid[0]?.length ?? 0;
  const height = grid.length;

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const [r, g, b] = cell.thread.rgb;
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          return (
            <div
              key={`${y}-${x}`}
              className={styles.cell}
              style={{
                backgroundColor: `rgb(${r},${g},${b})`,
                color: brightness > 140 ? "#000" : "#fff",
              }}
            >
              {cell.number}
            </div>
          );
        })
      )}
    </div>
  );
}
