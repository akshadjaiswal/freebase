// Single collapsed launcher button that fans out into a speed-dial menu
// of the 3 surface buttons (feedback / changelog / roadmap) on click.

const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

export function createLauncher(position: "bottom-right" | "bottom-left", onToggle?: (open: boolean) => void) {
  const posClass = position === "bottom-left" ? "fb-left" : "fb-right";
  let open = false;

  const dial = document.createElement("div");
  dial.className = `fb-dial ${posClass}`;

  const launcher = document.createElement("button");
  launcher.className = `fb-launcher ${posClass}`;
  launcher.setAttribute("aria-label", "Open feedback menu");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = CHAT_ICON;

  const badge = document.createElement("span");
  badge.className = "fb-badge";
  badge.style.display = "none";
  launcher.appendChild(badge);

  function setOpen(next: boolean) {
    open = next;
    dial.classList.toggle("fb-dial-open", open);
    launcher.classList.toggle("fb-launcher-open", open);
    launcher.innerHTML = open ? CLOSE_ICON : CHAT_ICON;
    launcher.appendChild(badge);
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? "Close feedback menu" : "Open feedback menu");
    onToggle?.(open);
  }

  launcher.addEventListener("click", () => setOpen(!open));

  document.addEventListener("click", (e) => {
    const path = e.composedPath();
    if (open && !path.includes(dial) && !path.includes(launcher)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  });

  document.body.appendChild(dial);
  document.body.appendChild(launcher);

  return {
    addSurfaceButton(btn: HTMLElement) {
      btn.classList.add("fb-btn-dial-item");
      dial.appendChild(btn);
    },
    setUnreadCount(count: number) {
      if (count > 0) {
        badge.textContent = String(count);
        badge.style.display = "inline-flex";
      } else {
        badge.style.display = "none";
      }
    },
    close() {
      setOpen(false);
    },
  };
}
