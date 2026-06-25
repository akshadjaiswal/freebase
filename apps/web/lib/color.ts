export function darkenHex(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 25);
  const g = Math.max(0, ((n >> 8) & 0xff) - 25);
  const b = Math.max(0, (n & 0xff) - 25);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
