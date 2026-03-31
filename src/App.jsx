import { useState, useEffect } from "react";
import Upload from "./components/Upload";
import Grid from "./components/Grid";
import Legend from "./components/Legend";
import Substitutes from "./components/Substitutes";
import { readImagePixels, buildPattern } from "./lib/pattern";
import styles from "./App.module.css";

export default function App() {
  const [pixels, setPixels] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("pattern");
  const [scale, setScale] = useState(1);
  const [stitchSize, setStitchSize] = useState(1);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [offsetTop, setOffsetTop] = useState(0);

  function zoomIn() { setScale(s => Math.min(+(s + 0.1).toFixed(2), 4)); }
  function zoomOut() { setScale(s => Math.max(+(s - 0.1).toFixed(2), 0.1)); }
  function zoomReset() { setScale(1); }

  function stitchUp() { setStitchSize(s => Math.min(s + 1, 20)); }
  function stitchDown() { setStitchSize(s => Math.max(s - 1, 1)); }

  async function handleImage(file) {
    setLoading(true);
    setError(null);
    try {
      const px = await readImagePixels(file);
      setPixels(px);
      setStitchSize(1);
      setOffsetLeft(0);
      setOffsetTop(0);
      setTab("pattern");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Rebuild pattern whenever pixels, stitch size, or offset changes
  useEffect(() => {
    if (!pixels) return;
    setResult(buildPattern(pixels, stitchSize, offsetLeft, offsetTop));
  }, [pixels, stitchSize, offsetLeft, offsetTop]);

  function handleReset() {
    setPixels(null);
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
        {!result && <Upload onImage={handleImage} onError={setError} />}

        {loading && <p className={styles.status}>Matching colors...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {result && (
          <>
            <div className={styles.tabBar}>
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
                <div className={styles.tabControls}>
                  <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Left</span>
                    <button className={styles.zoomBtn} onClick={() => setOffsetLeft(o => Math.max(o - 1, 0))} disabled={offsetLeft <= 0}>−</button>
                    <span className={styles.controlValue}>{offsetLeft}px</span>
                    <button className={styles.zoomBtn} onClick={() => setOffsetLeft(o => pixels ? Math.min(o + 1, pixels.width - 1) : o)}>+</button>
                  </div>
                  <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Top</span>
                    <button className={styles.zoomBtn} onClick={() => setOffsetTop(o => Math.max(o - 1, 0))} disabled={offsetTop <= 0}>−</button>
                    <span className={styles.controlValue}>{offsetTop}px</span>
                    <button className={styles.zoomBtn} onClick={() => setOffsetTop(o => pixels ? Math.min(o + 1, pixels.height - 1) : o)}>+</button>
                  </div>
                  <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Stitch</span>
                    <button className={styles.zoomBtn} onClick={stitchDown} disabled={stitchSize <= 1}>−</button>
                    <span className={styles.controlValue}>{stitchSize}px</span>
                    <button className={styles.zoomBtn} onClick={stitchUp} disabled={stitchSize >= 20}>+</button>
                  </div>
                  <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Zoom</span>
                    <button className={styles.zoomBtn} onClick={zoomOut} disabled={scale <= 0.1}>−</button>
                    <button className={styles.zoomReset} onClick={zoomReset}>{Math.round(scale * 100)}%</button>
                    <button className={styles.zoomBtn} onClick={zoomIn} disabled={scale >= 4}>+</button>
                  </div>
                </div>
              )}
            </div>

            {tab === "pattern" && (
              <div className={styles.output}>
                <div className={styles.gridColumn}>
                  <Grid grid={result.grid} scale={scale} onScaleChange={setScale} />
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
