import { NavLink } from "react-router-dom";
import { Waves, MapPin, Layers, Activity } from "lucide-react";

import styles from "./Navbar.module.css";

const links = [
  { to: "/", label: "Predict", icon: Waves, end: true },
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/batch", label: "Batch", icon: Layers },
  { to: "/monitoring", label: "Monitor", icon: Activity },
];

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} end>
          <span className={styles.logo}>
            <Waves size={20} strokeWidth={2.4} />
          </span>
          <span className={styles.brandText}>FloodWatch SL</span>
        </NavLink>

        <nav className={styles.links}>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              <Icon size={16} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
