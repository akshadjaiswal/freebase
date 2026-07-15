import { OrgConfig, ChangelogEntry, fetchRecentChangelog } from "./api";

const BELL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const STORAGE_KEY_PREFIX = "freebase_cl_read_";

function getReadIds(orgSlug: string): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${orgSlug}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markAllRead(orgSlug: string, ids: string[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${orgSlug}`, JSON.stringify(ids));
  } catch {}
}

function countUnread(orgSlug: string, entries: ChangelogEntry[]): number {
  const read = new Set(getReadIds(orgSlug));
  return entries.filter((e) => !read.has(e.id)).length;
}

export function createChangelogWidget(
  config: OrgConfig,
  position: "bottom-right" | "bottom-left",
  appUrl: string,
  closeOthers: () => void = () => {},
  onUnreadChange?: (count: number) => void,
  onOpenChange?: (open: boolean) => void
) {
  const posClass = position === "bottom-left" ? "fb-left" : "fb-right";
  let entries: ChangelogEntry[] = [];
  let isOpen = false;

  // "What's new" button
  const btn = document.createElement("button");
  btn.className = "fb-btn-surface";
  btn.setAttribute("aria-label", "What's new");
  btn.innerHTML = BELL_ICON;

  // Floating window
  const popup = document.createElement("div");
  popup.className = `fb-window ${posClass}`;
  popup.setAttribute("data-fb-theme", "dark");
  popup.style.cssText = "height:500px;bottom:88px";
  popup.innerHTML = buildPopupShell(config, appUrl);

  document.body.appendChild(popup);
  document.body.appendChild(btn);

  function updateBadge(count: number) {
    let badge = btn.querySelector(".fb-badge");
    if (count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "fb-badge";
        btn.appendChild(badge);
      }
      badge.textContent = String(count);
    } else {
      badge?.remove();
    }
  }

  function openPopup() {
    closeOthers();
    isOpen = true;
    popup.classList.add("fb-open");
    // Mark all as read when popup opens
    markAllRead(config.slug, entries.map((e) => e.id));
    updateBadge(0);
    onUnreadChange?.(0);
    onOpenChange?.(true);
  }

  function closePopup() {
    isOpen = false;
    popup.classList.remove("fb-open");
    onOpenChange?.(false);
  }

  function renderEntries(items: ChangelogEntry[]) {
    const body = popup.querySelector(".fb-cl-body");
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = `<div class="fb-empty">No updates yet.</div>`;
      return;
    }

    body.innerHTML = items
      .map(
        (e) => `
      <div class="fb-cl-item" data-slug="${escAttr(e.slug)}">
        <p class="fb-cl-item-title">${escHtml(e.title)}</p>
        <div class="fb-cl-item-meta">
          <span class="fb-cl-label fb-cl-label-${escAttr(e.label)}">${escHtml(e.label)}</span>
          <span>${formatDate(e.publishedAt)}</span>
        </div>
      </div>
    `
      )
      .join("");

    // Clicking item opens full changelog page in new tab
    body.querySelectorAll(".fb-cl-item").forEach((item) => {
      item.addEventListener("click", () => {
        const slug = item.getAttribute("data-slug");
        if (slug) window.open(`${appUrl}/${config.slug}/changelog/${slug}`, "_blank");
      });
    });
  }

  // Load entries and update badge
  fetchRecentChangelog(config.slug).then((data) => {
    entries = data;
    renderEntries(entries);
    const unread = countUnread(config.slug, entries);
    updateBadge(unread);
    onUnreadChange?.(unread);
  });

  btn.addEventListener("click", () => {
    if (isOpen) {
      closePopup();
    } else {
      openPopup();
    }
  });

  popup.querySelector(".fb-close")?.addEventListener("click", closePopup);

  document.addEventListener("click", (e) => {
    const path = e.composedPath();
    if (isOpen && !path.includes(popup) && !path.includes(btn)) {
      closePopup();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closePopup();
  });

  return {
    open: openPopup,
    close: closePopup,
    getUnreadCount: () => countUnread(config.slug, entries),
    getButton: () => btn,
  };
}

function buildPopupShell(config: OrgConfig, appUrl: string): string {
  return `
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">What's new</p>
      </div>
      <button class="fb-close" aria-label="Close">${CLOSE_ICON}</button>
    </div>
    <div class="fb-cl-body">
      <div class="fb-loading">Loading...</div>
    </div>
    <div class="fb-window-footer">
      <a href="${escAttr(appUrl)}/${escAttr(config.slug)}/changelog" target="_blank" rel="noopener">View all updates →</a>
    </div>
  `;
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(str: string): string {
  return str.replace(/"/g, "&quot;");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}
