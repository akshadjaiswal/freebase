import { OrgConfig, RoadmapData, fetchRoadmap } from "./api";

const MAP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`;
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

export function createRoadmapWidget(
  config: OrgConfig,
  position: "bottom-right" | "bottom-left",
  appUrl: string,
  closeOthers: () => void = () => {},
  onOpenChange?: (open: boolean) => void
) {
  const posClass = position === "bottom-left" ? "fb-left" : "fb-right";
  let isOpen = false;

  // Floating button (map icon)
  const btn = document.createElement("button");
  btn.className = "fb-btn-surface";
  btn.setAttribute("aria-label", "Roadmap");
  btn.innerHTML = MAP_ICON;

  // Floating window
  const panel = document.createElement("div");
  panel.className = `fb-window ${posClass}`;
  panel.setAttribute("data-fb-theme", "dark");
  panel.style.cssText = "height:580px;bottom:88px";
  panel.innerHTML = buildPanelShell(config);

  document.body.appendChild(panel);
  document.body.appendChild(btn);

  function openPanel() {
    closeOthers();
    isOpen = true;
    panel.classList.add("fb-open");
    loadRoadmap();
    onOpenChange?.(true);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove("fb-open");
    onOpenChange?.(false);
  }

  async function loadRoadmap() {
    const body = panel.querySelector(".fb-window-body");
    if (!body) return;

    const data = await fetchRoadmap(config.slug);
    if (!data) {
      body.innerHTML = `<div class="fb-empty">Could not load roadmap.</div>`;
      return;
    }

    body.innerHTML = buildKanban(data);
  }

  btn.addEventListener("click", () => {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  });

  panel.querySelector(".fb-close")?.addEventListener("click", closePanel);

  document.addEventListener("click", (e) => {
    const path = e.composedPath();
    if (isOpen && !path.includes(panel) && !path.includes(btn)) {
      closePanel();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closePanel();
  });

  return {
    open: openPanel,
    close: closePanel,
    getButton: () => btn,
  };
}

function buildPanelShell(config: OrgConfig): string {
  return `
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">Roadmap</p>
      </div>
      <button class="fb-close" aria-label="Close">${CLOSE_ICON}</button>
    </div>
    <div class="fb-window-body">
      <div class="fb-loading">Loading roadmap...</div>
    </div>
  `;
}

function buildKanban(data: RoadmapData): string {
  const col = (
    title: string,
    items: RoadmapData["planned"]
  ) => `
    <div class="fb-kanban-col">
      <p class="fb-kanban-col-title">
        ${escHtml(title)}
        <span class="fb-kanban-col-count">${items.length}</span>
      </p>
      ${
        items.length === 0
          ? `<div style="font-size:11px;color:var(--fb-text-muted);padding:8px 0">Nothing here yet</div>`
          : items
              .map(
                (item) => `
          <div class="fb-kanban-card">
            <p class="fb-kanban-card-title">${escHtml(item.title)}</p>
            ${item.votes > 0 ? `<span class="fb-kanban-card-votes">▲ ${item.votes}</span>` : ""}
          </div>
        `
              )
              .join("")
      }
    </div>
  `;

  return `
    <div class="fb-kanban">
      ${col("Planned", data.planned)}
      ${col("In Progress", data.inProgress)}
      ${col("Done", data.done)}
    </div>
  `;
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
