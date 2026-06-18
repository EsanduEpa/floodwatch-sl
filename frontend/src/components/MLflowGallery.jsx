import styles from "./MLflowGallery.module.css";

/**
 * 2x2 grid of MLflow screenshots. `items` = [{ src, caption }].
 * Click-to-zoom opens the full image in a new tab. A failed image hides itself.
 * If `items` is empty, a gentle placeholder is shown.
 */
export default function MLflowGallery({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className={styles.empty}>
        Experiment tracking screenshots will appear here when added
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((it) => (
        <figure key={it.src} className={styles.figure}>
          <a href={it.src} target="_blank" rel="noreferrer" className={styles.link}>
            <img
              src={it.src}
              alt={it.caption}
              className={styles.img}
              loading="lazy"
              onError={(e) => {
                const fig = e.currentTarget.closest("figure");
                if (fig) fig.style.display = "none";
              }}
            />
          </a>
          <figcaption className={styles.caption}>{it.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
