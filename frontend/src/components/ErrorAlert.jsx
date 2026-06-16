import { AlertTriangle } from "lucide-react";

import styles from "./ErrorAlert.module.css";

export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className={styles.alert} role="alert">
      <AlertTriangle size={18} strokeWidth={2.2} className={styles.icon} />
      <span>{message}</span>
    </div>
  );
}
