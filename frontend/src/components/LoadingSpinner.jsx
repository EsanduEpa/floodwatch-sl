import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner({ size = 18, label }) {
  return (
    <span className={styles.wrap}>
      <span
        className={styles.spinner}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
