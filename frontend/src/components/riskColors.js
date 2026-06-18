// Reads the --risk-* design tokens as literal color strings for use in JS
// (recharts needs real colors; var(--x) does not resolve in SVG attributes).
export function readRiskColors() {
  const s = getComputedStyle(document.documentElement);
  const get = (name, fallback) => s.getPropertyValue(name).trim() || fallback;
  return {
    Low: get("--risk-low", "#16A34A"),
    Moderate: get("--risk-moderate", "#D97706"),
    High: get("--risk-high", "#DC2626"),
    Critical: get("--risk-critical", "#991B1B"),
  };
}
