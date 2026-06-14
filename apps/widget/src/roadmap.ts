import { OrgConfig, RoadmapData, fetchRoadmap } from "./api";

const MAP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`;
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

export function createRoadmapWidget(
  config: OrgConfig,
  position: "bottom-right" | "bottom-left",
  appUrl: string
) {
  const posClass = position === "bottom-left" ? "fb-left" : "fb-right";
  let isOpen = false;
  let dataLoaded = false;

  // Floating button (map icon)
  const btn = document.createElement("button");
  btn.className = `fb-btn-float ${posClass}`;
  btn.setAttribute("aria-label", "Roadmap");
  btn.innerHTML = MAP_ICON;
  btn.style.bottom = "84px"; // stack above feedback button

  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "fb-overlay";

  // Panel
  const panel = document.createElement("div");
  panel.className = `fb-panel ${posClass}`;
  panel.setAttribute("data-fb-theme", "dark");
  panel.innerHTML = buildPanelShell(config);

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
  document.body.appendChild(btn);

  function openPanel() {
    isOpen = true;
    panel.classList.add("fb-open");
    overlay.classList.add("fb-open");

    if (!dataLoaded) {
      dataLoaded = true;
      loadRoadmap();
    }
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove("fb-open");
    overlay.classList.remove("fb-open");
  }

  async function loadRoadmap() {
    const body = panel.querySelector(".fb-panel-body");
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

  overlay.addEventListener("click", closePanel);
  panel.querySelector(".fb-close")?.addEventListener("click", closePanel);

  return {
    open: openPanel,
    close: closePanel,
    getButton: () => btn,
  };
}

function buildPanelShell(config: OrgConfig): string {
  return `
    <div class="fb-panel-header">
      <p class="fb-panel-title">${escHtml(config.name)} — Roadmap</p>
      <button class="fb-close" aria-label="Close">${CLOSE_ICON}</button>
    </div>
    <div class="fb-panel-body" style="padding:16px">
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
