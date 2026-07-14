(function(){"use strict";let $=null,z="";function Y(e){z=e}function O(e){$=e}function W(e){const t={"Content-Type":"application/json",...e};return $&&(t["X-Freebase-User"]=$),t}async function L(e,t={}){try{const a=await fetch(`${z}${e}`,{...t,headers:W(t.headers)});return a.ok?a.json():null}catch(a){return null}}async function J(e){return L(`/api/widget/${e}/config`)}async function K(e,t){return L(`/api/widget/${e}/identify`,{method:"POST",body:JSON.stringify({jwt:t})})}async function G(e){var a;const t=await L(`/api/v1/orgs/${e}/changelog?status=published&limit=5`);return(a=t==null?void 0:t.data)!=null?a:[]}async function X(e){return L(`/api/v1/orgs/${e}/roadmap`)}async function V(e,t){return await L(`/api/v1/orgs/${e}/posts`,{method:"POST",body:JSON.stringify(t)})!==null}function Z(e){const t="freebase-styles";if(document.getElementById(t))return;const a=document.createElement("style");a.id=t,a.textContent=Q(e),document.head.appendChild(a)}function Q(e){return`
:root {
  --fb-accent: ${e};
  --fb-accent-hover: ${ee(e)};
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

.fb-launcher.fb-launcher-open { transform: rotate(0deg); }
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
`}function ee(e){const t=parseInt(e.replace("#",""),16),a=Math.max(0,(t>>16&255)-25),r=Math.max(0,(t>>8&255)-25),o=Math.max(0,(t&255)-25);return`#${(a<<16|r<<8|o).toString(16).padStart(6,"0")}`}const te='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',ne='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',oe='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';function ae(e,t,a,r=()=>{}){var d;const o={open:!1,submitting:!1,success:!1},c=t==="bottom-left"?"fb-left":"fb-right",i=document.createElement("button");i.className="fb-btn-surface",i.setAttribute("aria-label","Submit feedback"),i.innerHTML=te;const n=document.createElement("div");n.className=`fb-window ${c}`,n.setAttribute("data-fb-theme","dark"),n.style.cssText="height:560px;bottom:88px",n.innerHTML=re(e),document.body.appendChild(n),document.body.appendChild(i);function s(){r(),o.open=!0,n.classList.add("fb-open")}function l(){o.open=!1,n.classList.remove("fb-open")}function h(){o.success=!1;const p=n.querySelector(".fb-window-body");p&&(p.innerHTML=T(e)),g()}function g(){const p=n.querySelector("#fb-feedback-form");p&&p.addEventListener("submit",async v=>{var R,D,U;if(v.preventDefault(),o.submitting)return;const f=n.querySelector("#fb-title"),b=n.querySelector("#fb-desc"),m=n.querySelector("#fb-email"),k=n.querySelector("#fb-category"),C=n.querySelector(".fb-error"),x=n.querySelector("#fb-submit"),P=(R=f==null?void 0:f.value.trim())!=null?R:"",$e=(b==null?void 0:b.value.trim())||void 0,_=(D=m==null?void 0:m.value.trim())!=null?D:"",Ee=(k==null?void 0:k.value)||void 0;if(P.length<5){C&&(C.textContent="Title must be at least 5 characters.");return}if(!_){C&&(C.textContent="Email is required.");return}o.submitting=!0,x&&(x.disabled=!0),x&&(x.textContent="Submitting...");const ze=await V(e.slug,{title:P,description:$e,categoryId:Ee,authorEmail:_});if(o.submitting=!1,!ze){x&&(x.disabled=!1),x&&(x.textContent="Submit"),C&&(C.textContent="Failed to submit. Please try again.");return}o.success=!0;const F=n.querySelector(".fb-window-body");F&&(F.innerHTML=`
          <div class="fb-success">
            <div class="fb-success-icon">${oe}</div>
            <div>
              <p style="font-weight:600;margin:0 0 4px;color:var(--fb-text)">Thanks for the feedback!</p>
              <p style="margin:0;font-size:13px">We'll review it shortly.</p>
            </div>
            <button id="fb-reset" style="background:none;border:1px solid var(--fb-border);border-radius:var(--fb-radius);padding:6px 14px;color:var(--fb-text-secondary);font-size:12px;cursor:pointer;font-family:inherit">Submit another</button>
          </div>
        `,(U=n.querySelector("#fb-reset"))==null||U.addEventListener("click",h))})}return i.addEventListener("click",()=>{o.open?l():s()}),(d=n.querySelector(".fb-close"))==null||d.addEventListener("click",l),document.addEventListener("click",p=>{o.open&&!n.contains(p.target)&&!i.contains(p.target)&&l()}),document.addEventListener("keydown",p=>{p.key==="Escape"&&o.open&&l()}),g(),{open:s,close:l,getButton:()=>i}}function re(e){return`
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
  `}function T(e){const t=e.categories.map(a=>`<option value="${se(a.id)}">${ie(a.name)}</option>`).join("");return`
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
  `}function ie(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function se(e){return e.replace(/"/g,"&quot;")}const le='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',ce='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',M="freebase_cl_read_";function de(e){try{const t=localStorage.getItem(`${M}${e}`);return t?JSON.parse(t):[]}catch(t){return[]}}function fe(e,t){try{localStorage.setItem(`${M}${e}`,JSON.stringify(t))}catch(a){}}function N(e,t){const a=new Set(de(e));return t.filter(r=>!a.has(r.id)).length}function be(e,t,a,r=()=>{},o){var v;const c=t==="bottom-left"?"fb-left":"fb-right";let i=[],n=!1;const s=document.createElement("button");s.className="fb-btn-surface",s.setAttribute("aria-label","What's new"),s.innerHTML=le;const l=document.createElement("div");l.className=`fb-window ${c}`,l.setAttribute("data-fb-theme","dark"),l.style.cssText="height:500px;bottom:88px",l.innerHTML=pe(e,a),document.body.appendChild(l),document.body.appendChild(s);function h(f){let b=s.querySelector(".fb-badge");f>0?(b||(b=document.createElement("span"),b.className="fb-badge",s.appendChild(b)),b.textContent=String(f)):b==null||b.remove()}function g(){r(),n=!0,l.classList.add("fb-open"),fe(e.slug,i.map(f=>f.id)),h(0),o==null||o(0)}function d(){n=!1,l.classList.remove("fb-open")}function p(f){const b=l.querySelector(".fb-cl-body");if(b){if(f.length===0){b.innerHTML='<div class="fb-empty">No updates yet.</div>';return}b.innerHTML=f.map(m=>`
      <div class="fb-cl-item" data-slug="${S(m.slug)}">
        <p class="fb-cl-item-title">${B(m.title)}</p>
        <div class="fb-cl-item-meta">
          <span class="fb-cl-label fb-cl-label-${S(m.label)}">${B(m.label)}</span>
          <span>${ue(m.publishedAt)}</span>
        </div>
      </div>
    `).join(""),b.querySelectorAll(".fb-cl-item").forEach(m=>{m.addEventListener("click",()=>{const k=m.getAttribute("data-slug");k&&window.open(`${a}/${e.slug}/changelog/${k}`,"_blank")})})}}return G(e.slug).then(f=>{i=f,p(i);const b=N(e.slug,i);h(b),o==null||o(b)}),s.addEventListener("click",()=>{n?d():g()}),(v=l.querySelector(".fb-close"))==null||v.addEventListener("click",d),document.addEventListener("click",f=>{n&&!l.contains(f.target)&&!s.contains(f.target)&&d()}),document.addEventListener("keydown",f=>{f.key==="Escape"&&n&&d()}),{open:g,close:d,getUnreadCount:()=>N(e.slug,i),getButton:()=>s}}function pe(e,t){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">What's new</p>
      </div>
      <button class="fb-close" aria-label="Close">${ce}</button>
    </div>
    <div class="fb-cl-body">
      <div class="fb-loading">Loading...</div>
    </div>
    <div class="fb-window-footer">
      <a href="${S(t)}/${S(e.slug)}/changelog" target="_blank" rel="noopener">View all updates →</a>
    </div>
  `}function B(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function S(e){return e.replace(/"/g,"&quot;")}function ue(e){try{return new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric"})}catch(t){return""}}const me='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',ge='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function he(e,t,a,r=()=>{}){var g;const o=t==="bottom-left"?"fb-left":"fb-right";let c=!1;const i=document.createElement("button");i.className="fb-btn-surface",i.setAttribute("aria-label","Roadmap"),i.innerHTML=me;const n=document.createElement("div");n.className=`fb-window ${o}`,n.setAttribute("data-fb-theme","dark"),n.style.cssText="height:580px;bottom:88px",n.innerHTML=xe(),document.body.appendChild(n),document.body.appendChild(i);function s(){r(),c=!0,n.classList.add("fb-open"),h()}function l(){c=!1,n.classList.remove("fb-open")}async function h(){const d=n.querySelector(".fb-window-body");if(!d)return;const p=await X(e.slug);if(!p){d.innerHTML='<div class="fb-empty">Could not load roadmap.</div>';return}d.innerHTML=we(p)}return i.addEventListener("click",()=>{c?l():s()}),(g=n.querySelector(".fb-close"))==null||g.addEventListener("click",l),document.addEventListener("click",d=>{c&&!n.contains(d.target)&&!i.contains(d.target)&&l()}),document.addEventListener("keydown",d=>{d.key==="Escape"&&c&&l()}),{open:s,close:l,getButton:()=>i}}function xe(e){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">Roadmap</p>
      </div>
      <button class="fb-close" aria-label="Close">${ge}</button>
    </div>
    <div class="fb-window-body">
      <div class="fb-loading">Loading roadmap...</div>
    </div>
  `}function we(e){const t=(a,r)=>`
    <div class="fb-kanban-col">
      <p class="fb-kanban-col-title">
        ${H(a)}
        <span class="fb-kanban-col-count">${r.length}</span>
      </p>
      ${r.length===0?'<div style="font-size:11px;color:var(--fb-text-muted);padding:8px 0">Nothing here yet</div>':r.map(o=>`
          <div class="fb-kanban-card">
            <p class="fb-kanban-card-title">${H(o.title)}</p>
            ${o.votes>0?`<span class="fb-kanban-card-votes">▲ ${o.votes}</span>`:""}
          </div>
        `).join("")}
    </div>
  `;return`
    <div class="fb-kanban">
      ${t("Planned",e.planned)}
      ${t("In Progress",e.inProgress)}
      ${t("Done",e.done)}
    </div>
  `}function H(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const j='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',ve='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function ye(e,t){const a=e==="bottom-left"?"fb-left":"fb-right";let r=!1;const o=document.createElement("div");o.className=`fb-dial ${a}`;const c=document.createElement("button");c.className=`fb-launcher ${a}`,c.setAttribute("aria-label","Open feedback menu"),c.setAttribute("aria-expanded","false"),c.innerHTML=j;const i=document.createElement("span");i.className="fb-badge",i.style.display="none",c.appendChild(i);function n(s){r=s,o.classList.toggle("fb-dial-open",r),c.classList.toggle("fb-launcher-open",r),c.innerHTML=r?ve:j,c.appendChild(i),c.setAttribute("aria-expanded",String(r)),c.setAttribute("aria-label",r?"Close feedback menu":"Open feedback menu")}return c.addEventListener("click",()=>n(!r)),document.addEventListener("click",s=>{const l=s.composedPath();r&&!l.includes(o)&&!l.includes(c)&&n(!1)}),document.addEventListener("keydown",s=>{s.key==="Escape"&&r&&n(!1)}),document.body.appendChild(o),document.body.appendChild(c),{addSurfaceButton(s){s.classList.add("fb-btn-dial-item"),o.appendChild(s)},setUnreadCount(s){s>0?(i.textContent=String(s),i.style.display="inline-flex"):i.style.display="none"},close(){n(!1)}}}let q=!1,E=null,y="";const u={feedback:null,changelog:null,roadmap:null};let w=null;async function ke(e){var h,g;if(q)return;q=!0;const{org:t,theme:a="auto",position:r="bottom-right",accentColor:o}=e,c=document.currentScript,i=(h=c==null?void 0:c.src)!=null?h:"";try{y=new URL(i).origin}catch(d){y=window.location.origin}Y(y);const n=await J(t);if(!n){console.warn("[Freebase] Could not load org config for:",t);return}E=n;const s=(g=o!=null?o:n.accentColor)!=null?g:"#10b981";Z(s),a!=="auto"&&document.documentElement.setAttribute("data-fb-theme",a);function l(d){var p,v,f;d!=="feedback"&&((p=u.feedback)==null||p.close()),d!=="changelog"&&((v=u.changelog)==null||v.close()),d!=="roadmap"&&((f=u.roadmap)==null||f.close())}u.feedback=ae(n,r,y,()=>l("feedback")),u.changelog=be(n,r,y,()=>l("changelog"),d=>w==null?void 0:w.setUnreadCount(d)),u.roadmap=he(n,r,y,()=>l("roadmap")),w=ye(r),w.addSurfaceButton(u.feedback.getButton()),w.addSurfaceButton(u.changelog.getButton()),w.addSurfaceButton(u.roadmap.getButton())}async function Ce(e){if(!E)return;const t=await K(E.slug,e.jwt);t!=null&&t.token?O(t.token):O(e.jwt)}function Le(e){var t,a,r;e==="feedback"&&((t=u.feedback)==null||t.open()),e==="changelog"&&((a=u.changelog)==null||a.open()),e==="roadmap"&&((r=u.roadmap)==null||r.open())}function Se(e){u.changelog?e(u.changelog.getUnreadCount()):e(0)}async function I(e,...t){switch(e){case"init":await ke(t[0]);break;case"identify":await Ce(t[0]);break;case"open":Le(t[0]);break;case"getUnreadCount":Se(t[0]);break;default:console.warn("[Freebase] Unknown command:",e)}}function A(){var r;const e=window.Freebase,t=(r=e==null?void 0:e.q)!=null?r:[],a=(...o)=>{I(o[0],...o.slice(1))};window.Freebase=a;for(const o of t)I(o[0],...o.slice(1))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A):A()})();
