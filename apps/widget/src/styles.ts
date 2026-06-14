// All widget CSS injected as a single <style> tag
// Uses CSS vars for theming — accentColor overridden per-org

export function injectStyles(accentColor: string) {
  const id = "freebase-styles";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = buildCss(accentColor);
  document.head.appendChild(style);
}

function buildCss(accent: string): string {
  return `
:root {
  --fb-accent: ${accent};
  --fb-accent-hover: ${darkenHex(accent)};
  --fb-bg: #0e0e10;
  --fb-surface: #141416;
  --fb-surface-raised: #1c1c1f;
  --fb-border: #2a2a2d;
  --fb-text: #e2e2e5;
  --fb-text-secondary: #a1a1aa;
  --fb-text-muted: #71717a;
  --fb-radius: 4px;
  --fb-radius-md: 6px;
  --fb-radius-lg: 8px;
  --fb-z: 2147483640;
}

@media (prefers-color-scheme: light) {
  :root {
    --fb-bg: #ffffff;
    --fb-surface: #f9f9f9;
    --fb-surface-raised: #f2f2f2;
    --fb-border: #e4e4e7;
    --fb-text: #111113;
    --fb-text-secondary: #52525b;
    --fb-text-muted: #a1a1aa;
  }
}

[data-fb-theme="dark"] {
  --fb-bg: #0e0e10;
  --fb-surface: #141416;
  --fb-surface-raised: #1c1c1f;
  --fb-border: #2a2a2d;
  --fb-text: #e2e2e5;
  --fb-text-secondary: #a1a1aa;
  --fb-text-muted: #71717a;
}

[data-fb-theme="light"] {
  --fb-bg: #ffffff;
  --fb-surface: #f9f9f9;
  --fb-surface-raised: #f2f2f2;
  --fb-border: #e4e4e7;
  --fb-text: #111113;
  --fb-text-secondary: #52525b;
  --fb-text-muted: #a1a1aa;
}

.fb-btn-float {
  position: fixed;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--fb-accent);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.32);
  z-index: var(--fb-z);
  transition: transform 150ms ease, background 150ms ease;
  padding: 0;
}

.fb-btn-float:hover {
  background: var(--fb-accent-hover);
  transform: scale(1.06);
}

.fb-btn-float.fb-right { right: 24px; }
.fb-btn-float.fb-left  { left: 24px; }

.fb-btn-whats-new {
  position: fixed;
  bottom: 80px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--fb-surface);
  border: 1px solid var(--fb-border);
  border-radius: 20px;
  color: var(--fb-text);
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  cursor: pointer;
  z-index: var(--fb-z);
  transition: background 150ms ease;
  white-space: nowrap;
}

.fb-btn-whats-new:hover { background: var(--fb-surface-raised); }
.fb-btn-whats-new.fb-right { right: 24px; }
.fb-btn-whats-new.fb-left  { left: 24px; }

.fb-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--fb-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  animation: fb-badge-pop 200ms ease-out;
}

@keyframes fb-badge-pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.fb-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  background: var(--fb-bg);
  border: 1px solid var(--fb-border);
  display: flex;
  flex-direction: column;
  z-index: var(--fb-z);
  transform: translateX(100%);
  transition: transform 200ms ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  font-size: 14px;
  color: var(--fb-text);
  overflow: hidden;
}

.fb-panel.fb-right { right: 0; border-left: 1px solid var(--fb-border); border-right: none; }
.fb-panel.fb-left  { left: 0;  border-right: 1px solid var(--fb-border); border-left: none; }
.fb-panel.fb-open  { transform: translateX(0); }

.fb-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--fb-border);
  flex-shrink: 0;
}

.fb-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--fb-text);
  margin: 0;
}

.fb-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.fb-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--fb-text-muted);
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: var(--fb-radius);
  transition: color 150ms;
}

.fb-close:hover { color: var(--fb-text); }

.fb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: calc(var(--fb-z) - 1);
  opacity: 0;
  transition: opacity 200ms;
  pointer-events: none;
}

.fb-overlay.fb-open {
  opacity: 1;
  pointer-events: auto;
}

.fb-form-group {
  margin-bottom: 12px;
}

.fb-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--fb-text-secondary);
  margin-bottom: 6px;
}

.fb-input, .fb-textarea, .fb-select {
  width: 100%;
  background: var(--fb-surface);
  border: 1px solid var(--fb-border);
  border-radius: var(--fb-radius);
  color: var(--fb-text);
  font-size: 13px;
  font-family: inherit;
  padding: 8px 10px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 150ms;
}

.fb-input:focus, .fb-textarea:focus, .fb-select:focus {
  border-color: var(--fb-accent);
}

.fb-textarea {
  min-height: 80px;
  resize: vertical;
}

.fb-btn-submit {
  width: 100%;
  padding: 9px 16px;
  background: var(--fb-accent);
  color: #fff;
  border: none;
  border-radius: var(--fb-radius);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 150ms;
  margin-top: 4px;
}

.fb-btn-submit:hover:not(:disabled) { background: var(--fb-accent-hover); }
.fb-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.fb-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
}

.fb-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  text-align: center;
  color: var(--fb-text-secondary);
}

.fb-success-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--fb-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fb-popup {
  position: fixed;
  width: 360px;
  max-width: calc(100vw - 32px);
  height: 480px;
  background: var(--fb-bg);
  border: 1px solid var(--fb-border);
  border-radius: var(--fb-radius-lg);
  z-index: var(--fb-z);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  font-size: 14px;
  color: var(--fb-text);
  opacity: 0;
  transform: scale(0.95) translateY(8px);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
  pointer-events: none;
  overflow: hidden;
}

.fb-popup.fb-open {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
}

.fb-popup.fb-right { right: 24px; }
.fb-popup.fb-left  { left: 24px; }
.fb-popup-bottom   { bottom: 88px; }

.fb-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--fb-border);
  flex-shrink: 0;
}

.fb-popup-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fb-text);
  margin: 0;
}

.fb-popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.fb-popup-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--fb-border);
  flex-shrink: 0;
}

.fb-popup-footer a {
  font-size: 12px;
  color: var(--fb-accent);
  text-decoration: none;
}

.fb-cl-item {
  padding: 10px 16px;
  border-bottom: 1px solid var(--fb-border);
  cursor: pointer;
  transition: background 150ms;
}

.fb-cl-item:last-child { border-bottom: none; }
.fb-cl-item:hover { background: var(--fb-surface-raised); }

.fb-cl-item-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--fb-text);
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fb-cl-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--fb-text-muted);
}

.fb-cl-label {
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 500;
  text-transform: lowercase;
}

.fb-cl-label-feature      { background: #10b98120; color: #10b981; }
.fb-cl-label-improvement  { background: #6366f120; color: #6366f1; }
.fb-cl-label-bug-fix      { background: #ef444420; color: #ef4444; }
.fb-cl-label-announcement { background: #f59e0b20; color: #f59e0b; }

.fb-kanban {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  min-width: 0;
}

.fb-kanban-col {
  flex: 1;
  min-width: 0;
}

.fb-kanban-col-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--fb-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.fb-kanban-col-count {
  background: var(--fb-surface-raised);
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 11px;
  color: var(--fb-text-muted);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.fb-kanban-card {
  background: var(--fb-surface);
  border: 1px solid var(--fb-border);
  border-radius: var(--fb-radius-md);
  padding: 8px 10px;
  margin-bottom: 6px;
  font-size: 12px;
}

.fb-kanban-card-title {
  color: var(--fb-text);
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 4px;
}

.fb-kanban-card-votes {
  color: var(--fb-text-muted);
  font-size: 11px;
}

.fb-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--fb-text-muted);
  font-size: 13px;
}

.fb-loading {
  padding: 24px 16px;
  text-align: center;
  color: var(--fb-text-muted);
  font-size: 13px;
}
`;
}

// Darken a hex color by ~10% for hover state
function darkenHex(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 25);
  const g = Math.max(0, ((n >> 8) & 0xff) - 25);
  const b = Math.max(0, (n & 0xff) - 25);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
