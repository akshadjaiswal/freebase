(function(){"use strict";let C=null,M="";function W(e){M=e}function N(e){C=e}function J(e){const t={"Content-Type":"application/json",...e};return C&&(t["X-Freebase-User"]=C),t}async function $(e,t={}){try{const n=await fetch(`${M}${e}`,{...t,headers:J(t.headers)});return n.ok?n.json():null}catch(n){return null}}async function K(e){return $(`/api/widget/${e}/config`)}async function G(e,t){return $(`/api/widget/${e}/identify`,{method:"POST",body:JSON.stringify({jwt:t})})}async function X(e){var n;const t=await $(`/api/v1/orgs/${e}/changelog?status=published&limit=5`);return(n=t==null?void 0:t.data)!=null?n:[]}async function V(e){return $(`/api/v1/orgs/${e}/roadmap`)}async function Z(e,t){return await $(`/api/v1/orgs/${e}/posts`,{method:"POST",body:JSON.stringify(t)})!==null}function Q(e){const t="freebase-styles";if(document.getElementById(t))return;const n=document.createElement("style");n.id=t,n.textContent=ee(e),document.head.appendChild(n)}function ee(e){return`
:root {
  --fb-accent: ${e};
  --fb-accent-hover: ${te(e)};
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

.fb-launcher {
  position: fixed;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--fb-accent);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.32);
  z-index: calc(var(--fb-z) + 2);
  transition: transform 150ms ease, background 150ms ease;
  padding: 0;
}

.fb-launcher:hover {
  background: var(--fb-accent-hover);
  transform: scale(1.06);
}

.fb-launcher.fb-right { right: 24px; }
.fb-launcher.fb-left  { left: 24px; }

.fb-dial {
  position: fixed;
  bottom: 92px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 12px;
  z-index: calc(var(--fb-z) + 1);
}

.fb-dial.fb-right { right: 28px; }
.fb-dial.fb-left  { left: 28px; }

.fb-btn-surface {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--fb-surface-raised);
  border: 1px solid var(--fb-border);
  color: var(--fb-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.28);
  transition: background 150ms ease, transform 150ms ease;
  padding: 0;
}

.fb-btn-surface:hover {
  background: var(--fb-surface);
  transform: scale(1.06);
}

.fb-btn-dial-item {
  opacity: 0;
  transform: scale(0.5) translateY(16px);
  pointer-events: none;
  transition: opacity 160ms ease, transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}

.fb-dial.fb-dial-open .fb-btn-dial-item {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.fb-dial.fb-dial-open .fb-btn-dial-item:nth-child(1) { transition-delay: 40ms; }
.fb-dial.fb-dial-open .fb-btn-dial-item:nth-child(2) { transition-delay: 90ms; }
.fb-dial.fb-dial-open .fb-btn-dial-item:nth-child(3) { transition-delay: 140ms; }

.fb-badge {
  position: absolute;
  top: -2px;
  right: -2px;
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

.fb-window {
  position: fixed;
  width: 400px;
  max-width: calc(100vw - 32px);
  background: var(--fb-bg);
  border: 1px solid var(--fb-border);
  border-radius: 12px;
  z-index: var(--fb-z);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  font-size: 14px;
  color: var(--fb-text);
  opacity: 0;
  transform: scale(0.92) translateY(12px);
  transition: opacity 200ms ease-out, transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
}

@media (prefers-color-scheme: light) {
  .fb-window { box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08); }
}

[data-fb-theme="light"] .fb-window { box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08); }

.fb-window.fb-right { right: 24px; }
.fb-window.fb-left  { left: 24px; }
.fb-window.fb-open  { opacity: 1; transform: scale(1) translateY(0); pointer-events: auto; }

.fb-window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 44px;
  border-bottom: 1px solid var(--fb-border);
  background: var(--fb-surface);
  flex-shrink: 0;
}

.fb-window-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fb-window-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fb-accent);
  flex-shrink: 0;
}

.fb-window-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fb-text);
  margin: 0;
}

.fb-window-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.fb-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--fb-text-muted);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--fb-radius);
  transition: color 150ms, background 150ms;
  flex-shrink: 0;
}

.fb-close:hover { color: var(--fb-text); background: var(--fb-surface-raised); }

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

.fb-window-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--fb-border);
  flex-shrink: 0;
  background: var(--fb-surface);
}

.fb-window-footer a {
  font-size: 12px;
  color: var(--fb-accent);
  text-decoration: none;
}

.fb-cl-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
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

@media (max-width: 480px) {
  .fb-window {
    right: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    width: 100%;
    max-width: 100%;
    height: 100% !important;
    border-radius: 0;
    transform: translateY(100%);
    transition: opacity 200ms ease-out, transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .fb-window.fb-open { transform: translateY(0); }

  .fb-launcher { bottom: 16px; }
  .fb-launcher.fb-right { right: 16px; }
  .fb-launcher.fb-left  { left: 16px; }

  .fb-dial { bottom: 80px; }
  .fb-dial.fb-right { right: 20px; }
  .fb-dial.fb-left  { left: 20px; }
}
`}function te(e){const t=parseInt(e.replace("#",""),16),n=Math.max(0,(t>>16&255)-25),c=Math.max(0,(t>>8&255)-25),a=Math.max(0,(t&255)-25);return`#${(n<<16|c<<8|a).toString(16).padStart(6,"0")}`}const oe='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',ne='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',ae='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';function re(e,t,n,c=()=>{},a){var u;const i={open:!1,submitting:!1,success:!1},p=t==="bottom-left"?"fb-left":"fb-right",s=document.createElement("button");s.className="fb-btn-surface",s.setAttribute("aria-label","Submit feedback"),s.innerHTML=oe;const r=document.createElement("div");r.className=`fb-window ${p}`,r.setAttribute("data-fb-theme","dark"),r.style.cssText="height:560px;bottom:88px",r.innerHTML=ie(e),document.body.appendChild(r),document.body.appendChild(s);function f(){c(),i.open=!0,r.classList.add("fb-open"),a==null||a(!0)}function o(){i.open=!1,r.classList.remove("fb-open"),a==null||a(!1)}function m(){i.success=!1;const l=r.querySelector(".fb-window-body");l&&(l.innerHTML=T(e)),w()}function w(){const l=r.querySelector("#fb-feedback-form");l&&l.addEventListener("submit",async x=>{var D,U,Y;if(x.preventDefault(),i.submitting)return;const b=r.querySelector("#fb-title"),d=r.querySelector("#fb-desc"),h=r.querySelector("#fb-email"),S=r.querySelector("#fb-category"),L=r.querySelector(".fb-error"),y=r.querySelector("#fb-submit"),F=(D=b==null?void 0:b.value.trim())!=null?D:"",Ce=(d==null?void 0:d.value.trim())||void 0,R=(U=h==null?void 0:h.value.trim())!=null?U:"",ze=(S==null?void 0:S.value)||void 0;if(F.length<5){L&&(L.textContent="Title must be at least 5 characters.");return}if(!R){L&&(L.textContent="Email is required.");return}i.submitting=!0,y&&(y.disabled=!0),y&&(y.textContent="Submitting...");const Me=await Z(e.slug,{title:F,description:Ce,categoryId:ze,authorEmail:R});if(i.submitting=!1,!Me){y&&(y.disabled=!1),y&&(y.textContent="Submit"),L&&(L.textContent="Failed to submit. Please try again.");return}i.success=!0;const O=r.querySelector(".fb-window-body");O&&(O.innerHTML=`
          <div class="fb-success">
            <div class="fb-success-icon">${ae}</div>
            <div>
              <p style="font-weight:600;margin:0 0 4px;color:var(--fb-text)">Thanks for the feedback!</p>
              <p style="margin:0;font-size:13px">We'll review it shortly.</p>
            </div>
            <button id="fb-reset" style="background:none;border:1px solid var(--fb-border);border-radius:var(--fb-radius);padding:6px 14px;color:var(--fb-text-secondary);font-size:12px;cursor:pointer;font-family:inherit">Submit another</button>
          </div>
        `,(Y=r.querySelector("#fb-reset"))==null||Y.addEventListener("click",m))})}return s.addEventListener("click",()=>{i.open?o():f()}),(u=r.querySelector(".fb-close"))==null||u.addEventListener("click",o),document.addEventListener("click",l=>{const x=l.composedPath();i.open&&!x.includes(r)&&!x.includes(s)&&o()}),document.addEventListener("keydown",l=>{l.key==="Escape"&&i.open&&o()}),w(),{open:f,close:o,getButton:()=>s}}function ie(e){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">Submit Feedback</p>
      </div>
      <button class="fb-close" aria-label="Close">${ne}</button>
    </div>
    <div class="fb-window-body">
      ${T(e)}
    </div>
  `}function T(e){const t=e.categories.map(n=>`<option value="${le(n.id)}">${se(n.name)}</option>`).join("");return`
    <form id="fb-feedback-form" style="display:flex;flex-direction:column;gap:0">
      <div class="fb-form-group">
        <label class="fb-label" for="fb-title">Title *</label>
        <input class="fb-input" id="fb-title" type="text" placeholder="Short summary of your idea or issue" maxlength="150" required />
      </div>
      <div class="fb-form-group">
        <label class="fb-label" for="fb-desc">Description</label>
        <textarea class="fb-textarea" id="fb-desc" placeholder="Tell us more..." maxlength="2000"></textarea>
      </div>
      ${e.categories.length>0?`
      <div class="fb-form-group">
        <label class="fb-label" for="fb-category">Category</label>
        <select class="fb-select" id="fb-category">
          <option value="">No category</option>
          ${t}
        </select>
      </div>`:""}
      <div class="fb-form-group">
        <label class="fb-label" for="fb-email">Your email *</label>
        <input class="fb-input" id="fb-email" type="email" placeholder="you@example.com" required />
      </div>
      <p class="fb-error"></p>
      <button class="fb-btn-submit" id="fb-submit" type="submit">Submit</button>
    </form>
  `}function se(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function le(e){return e.replace(/"/g,"&quot;")}const ce='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',de='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',q="freebase_cl_read_";function fe(e){try{const t=localStorage.getItem(`${q}${e}`);return t?JSON.parse(t):[]}catch(t){return[]}}function be(e,t){try{localStorage.setItem(`${q}${e}`,JSON.stringify(t))}catch(n){}}function B(e,t){const n=new Set(fe(e));return t.filter(c=>!n.has(c.id)).length}function ue(e,t,n,c=()=>{},a,i){var x;const p=t==="bottom-left"?"fb-left":"fb-right";let s=[],r=!1;const f=document.createElement("button");f.className="fb-btn-surface",f.setAttribute("aria-label","What's new"),f.innerHTML=ce;const o=document.createElement("div");o.className=`fb-window ${p}`,o.setAttribute("data-fb-theme","dark"),o.style.cssText="height:500px;bottom:88px",o.innerHTML=pe(e,n),document.body.appendChild(o),document.body.appendChild(f);function m(b){let d=f.querySelector(".fb-badge");b>0?(d||(d=document.createElement("span"),d.className="fb-badge",f.appendChild(d)),d.textContent=String(b)):d==null||d.remove()}function w(){c(),r=!0,o.classList.add("fb-open"),be(e.slug,s.map(b=>b.id)),m(0),a==null||a(0),i==null||i(!0)}function u(){r=!1,o.classList.remove("fb-open"),i==null||i(!1)}function l(b){const d=o.querySelector(".fb-cl-body");if(d){if(b.length===0){d.innerHTML='<div class="fb-empty">No updates yet.</div>';return}d.innerHTML=b.map(h=>`
      <div class="fb-cl-item" data-slug="${E(h.slug)}">
        <p class="fb-cl-item-title">${H(h.title)}</p>
        <div class="fb-cl-item-meta">
          <span class="fb-cl-label fb-cl-label-${E(h.label)}">${H(h.label)}</span>
          <span>${me(h.publishedAt)}</span>
        </div>
      </div>
    `).join(""),d.querySelectorAll(".fb-cl-item").forEach(h=>{h.addEventListener("click",()=>{const S=h.getAttribute("data-slug");S&&window.open(`${n}/${e.slug}/changelog/${S}`,"_blank")})})}}return X(e.slug).then(b=>{s=b,l(s);const d=B(e.slug,s);m(d),a==null||a(d)}),f.addEventListener("click",()=>{r?u():w()}),(x=o.querySelector(".fb-close"))==null||x.addEventListener("click",u),document.addEventListener("click",b=>{const d=b.composedPath();r&&!d.includes(o)&&!d.includes(f)&&u()}),document.addEventListener("keydown",b=>{b.key==="Escape"&&r&&u()}),{open:w,close:u,getUnreadCount:()=>B(e.slug,s),getButton:()=>f}}function pe(e,t){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">What's new</p>
      </div>
      <button class="fb-close" aria-label="Close">${de}</button>
    </div>
    <div class="fb-cl-body">
      <div class="fb-loading">Loading...</div>
    </div>
    <div class="fb-window-footer">
      <a href="${E(t)}/${E(e.slug)}/changelog" target="_blank" rel="noopener">View all updates →</a>
    </div>
  `}function H(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function E(e){return e.replace(/"/g,"&quot;")}function me(e){try{return new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric"})}catch(t){return""}}const ge='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',xe='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function he(e,t,n,c=()=>{},a){var w;const i=t==="bottom-left"?"fb-left":"fb-right";let p=!1;const s=document.createElement("button");s.className="fb-btn-surface",s.setAttribute("aria-label","Roadmap"),s.innerHTML=ge;const r=document.createElement("div");r.className=`fb-window ${i}`,r.setAttribute("data-fb-theme","dark"),r.style.cssText="height:580px;bottom:88px",r.innerHTML=we(),document.body.appendChild(r),document.body.appendChild(s);function f(){c(),p=!0,r.classList.add("fb-open"),m(),a==null||a(!0)}function o(){p=!1,r.classList.remove("fb-open"),a==null||a(!1)}async function m(){const u=r.querySelector(".fb-window-body");if(!u)return;const l=await V(e.slug);if(!l){u.innerHTML='<div class="fb-empty">Could not load roadmap.</div>';return}u.innerHTML=ve(l)}return s.addEventListener("click",()=>{p?o():f()}),(w=r.querySelector(".fb-close"))==null||w.addEventListener("click",o),document.addEventListener("click",u=>{const l=u.composedPath();p&&!l.includes(r)&&!l.includes(s)&&o()}),document.addEventListener("keydown",u=>{u.key==="Escape"&&p&&o()}),{open:f,close:o,getButton:()=>s}}function we(e){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">Roadmap</p>
      </div>
      <button class="fb-close" aria-label="Close">${xe}</button>
    </div>
    <div class="fb-window-body">
      <div class="fb-loading">Loading roadmap...</div>
    </div>
  `}function ve(e){const t=(n,c)=>`
    <div class="fb-kanban-col">
      <p class="fb-kanban-col-title">
        ${j(n)}
        <span class="fb-kanban-col-count">${c.length}</span>
      </p>
      ${c.length===0?'<div style="font-size:11px;color:var(--fb-text-muted);padding:8px 0">Nothing here yet</div>':c.map(a=>`
          <div class="fb-kanban-card">
            <p class="fb-kanban-card-title">${j(a.title)}</p>
            ${a.votes>0?`<span class="fb-kanban-card-votes">▲ ${a.votes}</span>`:""}
          </div>
        `).join("")}
    </div>
  `;return`
    <div class="fb-kanban">
      ${t("Planned",e.planned)}
      ${t("In Progress",e.inProgress)}
      ${t("Done",e.done)}
    </div>
  `}function j(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const I='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',ye='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function ke(e){const t=e==="bottom-left"?"fb-left":"fb-right";let n=!1,c=!1;const a=document.createElement("div");a.className=`fb-dial ${t}`;const i=document.createElement("button");i.className=`fb-launcher ${t}`,i.setAttribute("aria-label","Open feedback menu"),i.setAttribute("aria-expanded","false");const p=document.createElement("span");p.className="fb-launcher-icon",p.innerHTML=I,i.appendChild(p);const s=document.createElement("span");s.className="fb-badge",s.style.display="none",i.appendChild(s);function r(){return n||c}function f(){const o=r();a.classList.toggle("fb-dial-open",o),i.classList.toggle("fb-launcher-open",o),p.innerHTML=o?ye:I,i.setAttribute("aria-expanded",String(o)),i.setAttribute("aria-label",o?"Close feedback menu":"Open feedback menu"),a.querySelectorAll(".fb-btn-dial-item").forEach(m=>{m.tabIndex=o?0:-1})}return i.addEventListener("click",()=>{n=!n,f()}),document.addEventListener("click",o=>{const m=o.composedPath();n&&!c&&!m.includes(a)&&!m.includes(i)&&(n=!1,f())}),document.addEventListener("keydown",o=>{o.key==="Escape"&&n&&!c&&(n=!1,f())}),document.body.appendChild(a),document.body.appendChild(i),{addSurfaceButton(o){o.classList.add("fb-btn-dial-item"),o.tabIndex=-1,a.appendChild(o)},setSurfaceOpen(o){c=o,o||(n=!1),f()},setUnreadCount(o){o>0?(s.textContent=String(o),s.style.display="inline-flex"):s.style.display="none"}}}let A=!1,z=null,k="";const g={feedback:null,changelog:null,roadmap:null};let v=null;async function Se(e){var w,u;if(A)return;A=!0;const{org:t,theme:n="auto",position:c="bottom-right",accentColor:a}=e,i=document.currentScript,p=(w=i==null?void 0:i.src)!=null?w:"";try{k=new URL(p).origin}catch(l){k=window.location.origin}W(k);const s=await K(t);if(!s){console.warn("[Freebase] Could not load org config for:",t);return}z=s;const r=(u=a!=null?a:s.accentColor)!=null?u:"#10b981";Q(r),n!=="auto"&&document.documentElement.setAttribute("data-fb-theme",n);function f(l){var x,b,d;l!=="feedback"&&((x=g.feedback)==null||x.close()),l!=="changelog"&&((b=g.changelog)==null||b.close()),l!=="roadmap"&&((d=g.roadmap)==null||d.close())}const o={feedback:!1,changelog:!1,roadmap:!1};function m(l,x){o[l]=x;const b=o.feedback||o.changelog||o.roadmap;v==null||v.setSurfaceOpen(b)}g.feedback=re(s,c,k,()=>f("feedback"),l=>m("feedback",l)),g.changelog=ue(s,c,k,()=>f("changelog"),l=>v==null?void 0:v.setUnreadCount(l),l=>m("changelog",l)),g.roadmap=he(s,c,k,()=>f("roadmap"),l=>m("roadmap",l)),v=ke(c),v.addSurfaceButton(g.feedback.getButton()),v.addSurfaceButton(g.changelog.getButton()),v.addSurfaceButton(g.roadmap.getButton())}async function Le(e){if(!z)return;const t=await G(z.slug,e.jwt);t!=null&&t.token?N(t.token):N(e.jwt)}function $e(e){var t,n,c;e==="feedback"&&((t=g.feedback)==null||t.open()),e==="changelog"&&((n=g.changelog)==null||n.open()),e==="roadmap"&&((c=g.roadmap)==null||c.open())}function Ee(e){g.changelog?e(g.changelog.getUnreadCount()):e(0)}async function P(e,...t){switch(e){case"init":await Se(t[0]);break;case"identify":await Le(t[0]);break;case"open":$e(t[0]);break;case"getUnreadCount":Ee(t[0]);break;default:console.warn("[Freebase] Unknown command:",e)}}function _(){var c;const e=window.Freebase,t=(c=e==null?void 0:e.q)!=null?c:[],n=(...a)=>{P(a[0],...a.slice(1))};window.Freebase=n;for(const a of t)P(a[0],...a.slice(1))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_):_()})();
