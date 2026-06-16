import styles from "./StatCard.module.css";

export default function StatCard({ value, label, icon: Icon }) {
  return (
    <div className={styles.card}>
      {Icon && (
        <span className={styles.icon}>
          <Icon size={20} strokeWidth={2.2} />
        </span>
      )}
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}
