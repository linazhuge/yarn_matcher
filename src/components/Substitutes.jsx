import styles from "./Substitutes.module.css";

function Swatch({ thread, label }) {
  const [r, g, b] = thread.rgb;
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return (
    <div className={styles.swatch}>
      <div
        className={styles.swatchColor}
        style={{ background: `rgb(${r},${g},${b})`, color: brightness > 140 ? "#000" : "#fff" }}
      >
        {label}
      </div>
      <div className={styles.swatchLabel}>
        <span className={styles.code}>{thread.code}</span>
        <span className={styles.name}>{thread.name}</span>
      </div>
    </div>
  );
}

export default function Substitutes({ legend }) {
  return (
    <div className={styles.list}>
      {legend.map((entry) => (
        <div key={entry.number} className={styles.row}>
          <Swatch thread={entry.thread} label={entry.number} />
          <div className={styles.arrow}>→</div>
          <div className={styles.alternatives}>
            {entry.alternatives.map((alt) => (
              <Swatch key={alt.code} thread={alt} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
