import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <h2 className={styles.title}>FloodWatch-SL</h2>
          <p className={styles.copy}>AI-Powered Flood Risk Assessment Platform</p>
        </div>

        <nav className={styles.links} aria-label="Footer navigation">
          <a href="/#home">Home</a>
          <a href="/#about">About</a>
          <a href="/#services">Services</a>
          <a href="/predict">Predict</a>
        </nav>

        <div className={styles.contact}>
          <a
            href="https://github.com/UmeshMadhusankha/floodwatch-sl"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Repository
          </a>
        </div>

        <p className={styles.copy}>© 2026 FloodWatch-SL. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
