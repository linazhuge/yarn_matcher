import { useState } from "react";
import Upload from "./components/Upload";
import Grid from "./components/Grid";
import Legend from "./components/Legend";
import Substitutes from "./components/Substitutes";
import { processImage } from "./lib/pattern";
import styles from "./App.module.css";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("pattern");

  async function handleImage(file) {
    setLoading(true);
    setError(null);
    try {
      const data = await processImage(file);
      setResult(data);
      setTab("pattern");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>🧵 Yarn Matcher</h1>
            <p className={styles.subtitle}>Upload a pixel image to generate your thread pattern</p>
          </div>
          {result && (
            <button className={styles.resetBtn} onClick={handleReset}>
              ↺ New image
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {!result && <Upload onImage={handleImage} />}

        {loading && <p className={styles.status}>Matching colors...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {result && (
          <>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === "pattern" ? styles.tabActive : ""}`}
                onClick={() => setTab("pattern")}
              >
                Pattern
              </button>
              <button
                className={`${styles.tab} ${tab === "substitutes" ? styles.tabActive : ""}`}
                onClick={() => setTab("substitutes")}
              >
                Substitutes
              </button>
            </div>

            {tab === "pattern" && (
              <div className={styles.output}>
                <div className={styles.gridWrapper}>
                  <Grid grid={result.grid} />
                </div>
                <div className={styles.legendWrapper}>
                  <Legend legend={result.legend} />
                </div>
              </div>
            )}

            {tab === "substitutes" && (
              <Substitutes legend={result.legend} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
