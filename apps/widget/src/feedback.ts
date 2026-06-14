import { OrgConfig, submitFeedback, getIdentityToken } from "./api";

const PENCIL_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

interface FeedbackState {
  open: boolean;
  submitting: boolean;
  success: boolean;
}

export function createFeedbackWidget(
  config: OrgConfig,
  position: "bottom-right" | "bottom-left",
  appUrl: string
) {
  const state: FeedbackState = { open: false, submitting: false, success: false };
  const posClass = position === "bottom-left" ? "fb-left" : "fb-right";

  // Floating button
  const btn = document.createElement("button");
  btn.className = `fb-btn-float ${posClass}`;
  btn.setAttribute("aria-label", "Submit feedback");
  btn.innerHTML = PENCIL_ICON;
  btn.style.bottom = "24px";

  // Overlay
  const overlay = document.createElement("div");
  overlay.className = "fb-overlay";

  // Panel
  const panel = document.createElement("div");
  panel.className = `fb-panel ${posClass}`;
  panel.setAttribute("data-fb-theme", "dark");
  panel.innerHTML = buildPanelHtml(config);

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
  document.body.appendChild(btn);

  function openPanel() {
    state.open = true;
    panel.classList.add("fb-open");
    overlay.classList.add("fb-open");
  }

  function closePanel() {
    state.open = false;
    panel.classList.remove("fb-open");
    overlay.classList.remove("fb-open");
  }

  function resetForm() {
    state.success = false;
    const body = panel.querySelector(".fb-panel-body");
    if (body) body.innerHTML = buildFormHtml(config);
    attachFormHandlers();
  }

  function attachFormHandlers() {
    const form = panel.querySelector("#fb-feedback-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (state.submitting) return;

      const titleEl = panel.querySelector<HTMLInputElement>("#fb-title");
      const descEl = panel.querySelector<HTMLTextAreaElement>("#fb-desc");
      const emailEl = panel.querySelector<HTMLInputElement>("#fb-email");
      const catEl = panel.querySelector<HTMLSelectElement>("#fb-category");
      const errorEl = panel.querySelector<HTMLElement>(".fb-error");
      const submitBtn = panel.querySelector<HTMLButtonElement>("#fb-submit");

      const title = titleEl?.value.trim() ?? "";
      const description = descEl?.value.trim() || undefined;
      const authorEmail = emailEl?.value.trim() ?? "";
      const categoryId = catEl?.value || undefined;

      if (title.length < 5) {
        if (errorEl) errorEl.textContent = "Title must be at least 5 characters.";
        return;
      }
      if (!authorEmail) {
        if (errorEl) errorEl.textContent = "Email is required.";
        return;
      }

      state.submitting = true;
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtn) submitBtn.textContent = "Submitting...";

      const identityToken = getIdentityToken();
      const ok = await submitFeedback(config.slug, {
        title,
        description,
        categoryId,
        authorEmail,
      });

      state.submitting = false;

      if (!ok) {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.textContent = "Submit";
        if (errorEl) errorEl.textContent = "Failed to submit. Please try again.";
        return;
      }

      // Success state
      state.success = true;
      const body = panel.querySelector(".fb-panel-body");
      if (body) {
        body.innerHTML = `
          <div class="fb-success">
            <div class="fb-success-icon">${CHECK_ICON}</div>
            <div>
              <p style="font-weight:600;margin:0 0 4px;color:var(--fb-text)">Thanks for the feedback!</p>
              <p style="margin:0;font-size:13px">We'll review it shortly.</p>
            </div>
            <button id="fb-reset" style="background:none;border:1px solid var(--fb-border);border-radius:var(--fb-radius);padding:6px 14px;color:var(--fb-text-secondary);font-size:12px;cursor:pointer;font-family:inherit">Submit another</button>
          </div>
        `;
        panel.querySelector("#fb-reset")?.addEventListener("click", resetForm);
      }
      // Suppress unused var warning — identityToken usage would be in a real identify flow
      void identityToken;
    });
  }

  btn.addEventListener("click", () => {
    if (state.open) {
      closePanel();
    } else {
      openPanel();
    }
  });

  overlay.addEventListener("click", closePanel);

  panel.querySelector(".fb-close")?.addEventListener("click", closePanel);

  attachFormHandlers();

  return {
    open: openPanel,
    close: closePanel,
    getButton: () => btn,
  };
}

function buildPanelHtml(config: OrgConfig): string {
  return `
    <div class="fb-panel-header">
      <p class="fb-panel-title">${escHtml(config.name)} — Submit Feedback</p>
      <button class="fb-close" aria-label="Close">${CLOSE_ICON}</button>
    </div>
    <div class="fb-panel-body">
      ${buildFormHtml(config)}
    </div>
  `;
}

function buildFormHtml(config: OrgConfig): string {
  const catOptions = config.categories
    .map((c) => `<option value="${escAttr(c.id)}">${escHtml(c.name)}</option>`)
    .join("");

  return `
    <form id="fb-feedback-form" style="display:flex;flex-direction:column;gap:0">
      <div class="fb-form-group">
        <label class="fb-label" for="fb-title">Title *</label>
        <input class="fb-input" id="fb-title" type="text" placeholder="Short summary of your idea or issue" maxlength="150" required />
      </div>
      <div class="fb-form-group">
        <label class="fb-label" for="fb-desc">Description</label>
        <textarea class="fb-textarea" id="fb-desc" placeholder="Tell us more..." maxlength="2000"></textarea>
      </div>
      ${config.categories.length > 0 ? `
      <div class="fb-form-group">
        <label class="fb-label" for="fb-category">Category</label>
        <select class="fb-select" id="fb-category">
          <option value="">No category</option>
          ${catOptions}
        </select>
      </div>` : ""}
      <div class="fb-form-group">
        <label class="fb-label" for="fb-email">Your email *</label>
        <input class="fb-input" id="fb-email" type="email" placeholder="you@example.com" required />
      </div>
      <p class="fb-error"></p>
      <button class="fb-btn-submit" id="fb-submit" type="submit">Submit</button>
    </form>
  `;
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(str: string): string {
  return str.replace(/"/g, "&quot;");
}
