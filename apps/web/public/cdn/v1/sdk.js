(function(){"use strict";let C=null,E="";function D(e){E=e}function q(e){C=e}function W(e){const t={"Content-Type":"application/json",...e};return C&&(t["X-Freebase-User"]=C),t}async function y(e,t={}){try{const o=await fetch(`${E}${e}`,{...t,headers:W(t.headers)});return o.ok?o.json():null}catch(o){return null}}async function J(e){return y(`/api/widget/${e}/config`)}async function X(e,t){return y(`/api/widget/${e}/identify`,{method:"POST",body:JSON.stringify({jwt:t})})}async function Y(e){var o;const t=await y(`/api/v1/orgs/${e}/changelog?status=published&limit=5`);return(o=t==null?void 0:t.data)!=null?o:[]}async function K(e){return y(`/api/v1/orgs/${e}/roadmap`)}async function G(e,t){return await y(`/api/v1/orgs/${e}/posts`,{method:"POST",body:JSON.stringify(t)})!==null}function V(e){const t="freebase-styles";if(document.getElementById(t))return;const o=document.createElement("style");o.id=t,o.textContent=Z(e),document.head.appendChild(o)}function Z(e){return`
:root {
  --fb-accent: ${e};
  --fb-accent-hover: ${Q(e)};
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
  bottom: 156px;
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
  overflow-y: auto;
  overflow-x: hidden;
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
.fb-popup-bottom   { bottom: 200px; }

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
`}function Q(e){const t=parseInt(e.replace("#",""),16),o=Math.max(0,(t>>16&255)-25),a=Math.max(0,(t>>8&255)-25),r=Math.max(0,(t&255)-25);return`#${(o<<16|a<<8|r).toString(16).padStart(6,"0")}`}const ee='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',te='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',ne='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';function oe(e,t,o){var g;const a={open:!1,submitting:!1,success:!1},r=t==="bottom-left"?"fb-left":"fb-right",f=document.createElement("button");f.className=`fb-btn-float ${r}`,f.setAttribute("aria-label","Submit feedback"),f.innerHTML=ee,f.style.bottom="24px";const i=document.createElement("div");i.className="fb-overlay";const n=document.createElement("div");n.className=`fb-panel ${r}`,n.setAttribute("data-fb-theme","dark"),n.innerHTML=ae(e),document.body.appendChild(i),document.body.appendChild(n),document.body.appendChild(f);function c(){a.open=!0,n.classList.add("fb-open"),i.classList.add("fb-open")}function d(){a.open=!1,n.classList.remove("fb-open"),i.classList.remove("fb-open")}function b(){a.success=!1;const s=n.querySelector(".fb-panel-body");s&&(s.innerHTML=M(e)),m()}function m(){const s=n.querySelector("#fb-feedback-form");s&&s.addEventListener("submit",async l=>{var _,U,R;if(l.preventDefault(),a.submitting)return;const p=n.querySelector("#fb-title"),v=n.querySelector("#fb-desc"),L=n.querySelector("#fb-email"),z=n.querySelector("#fb-category"),h=n.querySelector(".fb-error"),x=n.querySelector("#fb-submit"),F=(_=p==null?void 0:p.value.trim())!=null?_:"",we=(v==null?void 0:v.value.trim())||void 0,A=(U=L==null?void 0:L.value.trim())!=null?U:"",ke=(z==null?void 0:z.value)||void 0;if(F.length<5){h&&(h.textContent="Title must be at least 5 characters.");return}if(!A){h&&(h.textContent="Email is required.");return}a.submitting=!0,x&&(x.disabled=!0),x&&(x.textContent="Submitting...");const Ce=await G(e.slug,{title:F,description:we,categoryId:ke,authorEmail:A});if(a.submitting=!1,!Ce){x&&(x.disabled=!1),x&&(x.textContent="Submit"),h&&(h.textContent="Failed to submit. Please try again.");return}a.success=!0;const B=n.querySelector(".fb-panel-body");B&&(B.innerHTML=`
          <div class="fb-success">
            <div class="fb-success-icon">${ne}</div>
            <div>
              <p style="font-weight:600;margin:0 0 4px;color:var(--fb-text)">Thanks for the feedback!</p>
              <p style="margin:0;font-size:13px">We'll review it shortly.</p>
            </div>
            <button id="fb-reset" style="background:none;border:1px solid var(--fb-border);border-radius:var(--fb-radius);padding:6px 14px;color:var(--fb-text-secondary);font-size:12px;cursor:pointer;font-family:inherit">Submit another</button>
          </div>
        `,(R=n.querySelector("#fb-reset"))==null||R.addEventListener("click",b))})}return f.addEventListener("click",()=>{a.open?d():c()}),i.addEventListener("click",d),(g=n.querySelector(".fb-close"))==null||g.addEventListener("click",d),m(),{open:c,close:d,getButton:()=>f}}function ae(e){return`
    <div class="fb-panel-header">
      <p class="fb-panel-title">${N(e.name)} — Submit Feedback</p>
      <button class="fb-close" aria-label="Close">${te}</button>
    </div>
    <div class="fb-panel-body">
      ${M(e)}
    </div>
  `}function M(e){const t=e.categories.map(o=>`<option value="${re(o.id)}">${N(o.name)}</option>`).join("");return`
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
  `}function N(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function re(e){return e.replace(/"/g,"&quot;")}const ie='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',O="freebase_cl_read_";function se(e){try{const t=localStorage.getItem(`${O}${e}`);return t?JSON.parse(t):[]}catch(t){return[]}}function le(e,t){try{localStorage.setItem(`${O}${e}`,JSON.stringify(t))}catch(o){}}function T(e,t){const o=new Set(se(e));return t.filter(a=>!o.has(a.id)).length}function fe(e,t,o){var g;const a=t==="bottom-left"?"fb-left":"fb-right";let r=[],f=!1;const i=document.createElement("button");i.className=`fb-btn-whats-new ${a}`,i.setAttribute("aria-label","What's new"),i.innerHTML="<span>What's new</span>";const n=document.createElement("div");n.className=`fb-popup ${a} fb-popup-bottom`,n.setAttribute("data-fb-theme","dark"),n.innerHTML=ce(e,o),document.body.appendChild(n),document.body.appendChild(i);function c(){f=!0,n.classList.add("fb-open"),le(e.slug,r.map(s=>s.id)),b(0)}function d(){f=!1,n.classList.remove("fb-open")}function b(s){let l=i.querySelector(".fb-badge");s>0?(l||(l=document.createElement("span"),l.className="fb-badge",i.appendChild(l)),l.textContent=String(s)):l==null||l.remove()}function m(s){const l=n.querySelector(".fb-popup-body");if(l){if(s.length===0){l.innerHTML='<div class="fb-empty">No updates yet.</div>';return}l.innerHTML=s.map(p=>`
      <div class="fb-cl-item" data-slug="${w(p.slug)}">
        <p class="fb-cl-item-title">${H(p.title)}</p>
        <div class="fb-cl-item-meta">
          <span class="fb-cl-label fb-cl-label-${w(p.label)}">${H(p.label)}</span>
          <span>${de(p.publishedAt)}</span>
        </div>
      </div>
    `).join(""),l.querySelectorAll(".fb-cl-item").forEach(p=>{p.addEventListener("click",()=>{const v=p.getAttribute("data-slug");v&&window.open(`${o}/${e.slug}/changelog/${v}`,"_blank")})})}}return Y(e.slug).then(s=>{r=s,m(r);const l=T(e.slug,r);b(l)}),i.addEventListener("click",()=>{f?d():c()}),(g=n.querySelector(".fb-close"))==null||g.addEventListener("click",d),document.addEventListener("click",s=>{f&&!n.contains(s.target)&&!i.contains(s.target)&&d()}),{open:c,close:d,getUnreadCount:()=>T(e.slug,r),getButton:()=>i}}function ce(e,t){return`
    <div class="fb-popup-header">
      <p class="fb-popup-title">What's new</p>
      <button class="fb-close" aria-label="Close">${ie}</button>
    </div>
    <div class="fb-popup-body">
      <div class="fb-loading">Loading...</div>
    </div>
    <div class="fb-popup-footer">
      <a href="${w(t)}/${w(e.slug)}/changelog" target="_blank" rel="noopener">View all updates →</a>
    </div>
  `}function H(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function w(e){return e.replace(/"/g,"&quot;")}function de(e){try{return new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric"})}catch(t){return""}}const be='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',pe='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function ue(e,t,o){var g;const a=t==="bottom-left"?"fb-left":"fb-right";let r=!1,f=!1;const i=document.createElement("button");i.className=`fb-btn-float ${a}`,i.setAttribute("aria-label","Roadmap"),i.innerHTML=be,i.style.bottom="84px";const n=document.createElement("div");n.className="fb-overlay";const c=document.createElement("div");c.className=`fb-panel ${a}`,c.setAttribute("data-fb-theme","dark"),c.innerHTML=me(e),document.body.appendChild(n),document.body.appendChild(c),document.body.appendChild(i);function d(){r=!0,c.classList.add("fb-open"),n.classList.add("fb-open"),f||(f=!0,m())}function b(){r=!1,c.classList.remove("fb-open"),n.classList.remove("fb-open")}async function m(){const s=c.querySelector(".fb-panel-body");if(!s)return;const l=await K(e.slug);if(!l){s.innerHTML='<div class="fb-empty">Could not load roadmap.</div>';return}s.innerHTML=ge(l)}return i.addEventListener("click",()=>{r?b():d()}),n.addEventListener("click",b),(g=c.querySelector(".fb-close"))==null||g.addEventListener("click",b),{open:d,close:b,getButton:()=>i}}function me(e){return`
    <div class="fb-panel-header">
      <p class="fb-panel-title">${$(e.name)} — Roadmap</p>
      <button class="fb-close" aria-label="Close">${pe}</button>
    </div>
    <div class="fb-panel-body" style="padding:16px">
      <div class="fb-loading">Loading roadmap...</div>
    </div>
  `}function ge(e){const t=(o,a)=>`
    <div class="fb-kanban-col">
      <p class="fb-kanban-col-title">
        ${$(o)}
        <span class="fb-kanban-col-count">${a.length}</span>
      </p>
      ${a.length===0?'<div style="font-size:11px;color:var(--fb-text-muted);padding:8px 0">Nothing here yet</div>':a.map(r=>`
          <div class="fb-kanban-card">
            <p class="fb-kanban-card-title">${$(r.title)}</p>
            ${r.votes>0?`<span class="fb-kanban-card-votes">▲ ${r.votes}</span>`:""}
          </div>
        `).join("")}
    </div>
  `;return`
    <div class="fb-kanban">
      ${t("Planned",e.planned)}
      ${t("In Progress",e.inProgress)}
      ${t("Done",e.done)}
    </div>
  `}function $(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}let I=!1,S=null,k="";const u={feedback:null,changelog:null,roadmap:null};async function xe(e){var d,b;if(I)return;I=!0;const{org:t,theme:o="auto",position:a="bottom-right",accentColor:r}=e,f=document.currentScript,i=(d=f==null?void 0:f.src)!=null?d:"";try{k=new URL(i).origin}catch(m){k=window.location.origin}D(k);const n=await J(t);if(!n){console.warn("[Freebase] Could not load org config for:",t);return}S=n;const c=(b=r!=null?r:n.accentColor)!=null?b:"#10b981";V(c),o!=="auto"&&document.documentElement.setAttribute("data-fb-theme",o),u.feedback=oe(n,a),u.changelog=fe(n,a,k),u.roadmap=ue(n,a)}async function ve(e){if(!S)return;const t=await X(S.slug,e.jwt);t!=null&&t.token?q(t.token):q(e.jwt)}function he(e){var t,o,a;e==="feedback"&&((t=u.feedback)==null||t.open()),e==="changelog"&&((o=u.changelog)==null||o.open()),e==="roadmap"&&((a=u.roadmap)==null||a.open())}function ye(e){u.changelog?e(u.changelog.getUnreadCount()):e(0)}async function j(e,...t){switch(e){case"init":await xe(t[0]);break;case"identify":await ve(t[0]);break;case"open":he(t[0]);break;case"getUnreadCount":ye(t[0]);break;default:console.warn("[Freebase] Unknown command:",e)}}function P(){var a;const e=window.Freebase,t=(a=e==null?void 0:e.q)!=null?a:[],o=(...r)=>{j(r[0],...r.slice(1))};window.Freebase=o;for(const r of t)j(r[0],...r.slice(1))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P):P()})();
