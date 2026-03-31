import styles from "./Legend.module.css";

export default function Legend({ legend }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Thread Colors</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Swatch</th>
            <th>DMC</th>
            <th>Name</th>
            <th>Pixels</th>
          </tr>
        </thead>
        <tbody>
          {legend.map((entry) => {
            const [r, g, b] = entry.thread.rgb;
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            return (
              <tr key={entry.number}>
                <td className={styles.num}>{entry.number}</td>
                <td>
                  <span
                    className={styles.swatch}
                    style={{
                      background: `rgb(${r},${g},${b})`,
                      color: brightness > 140 ? "#000" : "#fff",
                    }}
                  >
                    {entry.number}
                  </span>
                </td>
                <td className={styles.code}>{entry.thread.code}</td>
                <td>{entry.thread.name}</td>
                <td className={styles.count}>{entry.count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
