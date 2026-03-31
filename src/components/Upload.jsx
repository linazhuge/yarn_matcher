import { useRef, useState } from "react";
import styles from "./Upload.module.css";

const MAX_FILE_SIZE_MB = 10;

export default function Upload({ onImage, onError, compact = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError?.(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    onImage(file);
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  if (compact) {
    return (
      <div className={styles.compact}>
        <button className={styles.compactBtn} onClick={() => inputRef.current.click()}>
          🧵 Change image
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} hidden />
      </div>
    );
  }

  return (
    <div
      className={`${styles.zone} ${dragging ? styles.dragging : ""}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <span className={styles.icon}>🧵</span>
      <p className={styles.primary}>Drop your image here</p>
      <p className={styles.secondary}>or click to browse · max 250,000 pixels, 10MB</p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} hidden />
    </div>
  );
}
