(function(){"use strict";let C=null,L="";function U(e){L=e}function z(e){C=e}function R(e){const t={"Content-Type":"application/json",...e};return C&&(t["X-Freebase-User"]=C),t}async function v(e,t={}){try{const o=await fetch(`${L}${e}`,{...t,headers:R(t.headers)});return o.ok?o.json():null}catch(o){return null}}async function D(e){return v(`/api/widget/${e}/config`)}async function W(e,t){return v(`/api/widget/${e}/identify`,{method:"POST",body:JSON.stringify({jwt:t})})}async function J(e){var o;const t=await v(`/api/v1/orgs/${e}/changelog?status=published&limit=5`);return(o=t==null?void 0:t.data)!=null?o:[]}async function K(e){return v(`/api/v1/orgs/${e}/roadmap`)}async function Y(e,t){return await v(`/api/v1/orgs/${e}/posts`,{method:"POST",body:JSON.stringify(t)})!==null}function G(e){const t="freebase-styles";if(document.getElementById(t))return;const o=document.createElement("style");o.id=t,o.textContent=X(e),document.head.appendChild(o)}function X(e){return`
:root {
  --fb-accent: ${e};
  --fb-accent-hover: ${V(e)};
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
`}function V(e){const t=parseInt(e.replace("#",""),16),o=Math.max(0,(t>>16&255)-25),a=Math.max(0,(t>>8&255)-25),i=Math.max(0,(t&255)-25);return`#${(o<<16|a<<8|i).toString(16).padStart(6,"0")}`}const Z="24px",Q='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',ee='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',te='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';function ne(e,t,o){var g;const a={open:!1,submitting:!1,success:!1},i=t==="bottom-left"?"fb-left":"fb-right",s=document.createElement("button");s.className=`fb-btn-float ${i}`,s.setAttribute("aria-label","Submit feedback"),s.innerHTML=Q,s.style.bottom=Z;const n=document.createElement("div");n.className=`fb-window ${i}`,n.setAttribute("data-fb-theme","dark"),n.style.cssText="height:560px;bottom:88px",n.innerHTML=oe(e),document.body.appendChild(n),document.body.appendChild(s);function r(){a.open=!0,n.classList.add("fb-open")}function p(){a.open=!1,n.classList.remove("fb-open")}function d(){a.success=!1;const f=n.querySelector(".fb-window-body");f&&(f.innerHTML=T(e)),u()}function u(){const f=n.querySelector("#fb-feedback-form");f&&f.addEventListener("submit",async c=>{var A,P,F;if(c.preventDefault(),a.submitting)return;const l=n.querySelector("#fb-title"),b=n.querySelector("#fb-desc"),h=n.querySelector("#fb-email"),S=n.querySelector("#fb-category"),w=n.querySelector(".fb-error"),x=n.querySelector("#fb-submit"),B=(A=l==null?void 0:l.value.trim())!=null?A:"",ke=(b==null?void 0:b.value.trim())||void 0,I=(P=h==null?void 0:h.value.trim())!=null?P:"",Ce=(S==null?void 0:S.value)||void 0;if(B.length<5){w&&(w.textContent="Title must be at least 5 characters.");return}if(!I){w&&(w.textContent="Email is required.");return}a.submitting=!0,x&&(x.disabled=!0),x&&(x.textContent="Submitting...");const $e=await Y(e.slug,{title:B,description:ke,categoryId:Ce,authorEmail:I});if(a.submitting=!1,!$e){x&&(x.disabled=!1),x&&(x.textContent="Submit"),w&&(w.textContent="Failed to submit. Please try again.");return}a.success=!0;const _=n.querySelector(".fb-window-body");_&&(_.innerHTML=`
          <div class="fb-success">
            <div class="fb-success-icon">${te}</div>
            <div>
              <p style="font-weight:600;margin:0 0 4px;color:var(--fb-text)">Thanks for the feedback!</p>
              <p style="margin:0;font-size:13px">We'll review it shortly.</p>
            </div>
            <button id="fb-reset" style="background:none;border:1px solid var(--fb-border);border-radius:var(--fb-radius);padding:6px 14px;color:var(--fb-text-secondary);font-size:12px;cursor:pointer;font-family:inherit">Submit another</button>
          </div>
        `,(F=n.querySelector("#fb-reset"))==null||F.addEventListener("click",d))})}return s.addEventListener("click",()=>{a.open?p():r()}),(g=n.querySelector(".fb-close"))==null||g.addEventListener("click",p),u(),{open:r,close:p,getButton:()=>s}}function oe(e){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">Submit Feedback</p>
      </div>
      <button class="fb-close" aria-label="Close">${ee}</button>
    </div>
    <div class="fb-window-body">
      ${T(e)}
    </div>
  `}function T(e){const t=e.categories.map(o=>`<option value="${re(o.id)}">${ae(o.name)}</option>`).join("");return`
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
  `}function ae(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function re(e){return e.replace(/"/g,"&quot;")}const ie='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',E="freebase_cl_read_";function se(e){try{const t=localStorage.getItem(`${E}${e}`);return t?JSON.parse(t):[]}catch(t){return[]}}function le(e,t){try{localStorage.setItem(`${E}${e}`,JSON.stringify(t))}catch(o){}}function O(e,t){const o=new Set(se(e));return t.filter(a=>!o.has(a.id)).length}function ce(e,t,o){var f;const a=t==="bottom-left"?"fb-left":"fb-right";let i=[],s=!1;const n=document.createElement("button");n.className=`fb-btn-whats-new ${a}`,n.setAttribute("aria-label","What's new"),n.innerHTML="<span>What's new</span>";const r=document.createElement("div");r.className=`fb-window ${a}`,r.setAttribute("data-fb-theme","dark"),r.style.cssText="height:500px;bottom:88px",r.innerHTML=de(e,o),document.body.appendChild(r),document.body.appendChild(n);function p(){s=!0,r.classList.add("fb-open"),le(e.slug,i.map(c=>c.id)),u(0)}function d(){s=!1,r.classList.remove("fb-open")}function u(c){let l=n.querySelector(".fb-badge");c>0?(l||(l=document.createElement("span"),l.className="fb-badge",n.appendChild(l)),l.textContent=String(c)):l==null||l.remove()}function g(c){const l=r.querySelector(".fb-cl-body");if(l){if(c.length===0){l.innerHTML='<div class="fb-empty">No updates yet.</div>';return}l.innerHTML=c.map(b=>`
      <div class="fb-cl-item" data-slug="${y(b.slug)}">
        <p class="fb-cl-item-title">${M(b.title)}</p>
        <div class="fb-cl-item-meta">
          <span class="fb-cl-label fb-cl-label-${y(b.label)}">${M(b.label)}</span>
          <span>${fe(b.publishedAt)}</span>
        </div>
      </div>
    `).join(""),l.querySelectorAll(".fb-cl-item").forEach(b=>{b.addEventListener("click",()=>{const h=b.getAttribute("data-slug");h&&window.open(`${o}/${e.slug}/changelog/${h}`,"_blank")})})}}return J(e.slug).then(c=>{i=c,g(i);const l=O(e.slug,i);u(l)}),n.addEventListener("click",()=>{s?d():p()}),(f=r.querySelector(".fb-close"))==null||f.addEventListener("click",d),document.addEventListener("click",c=>{s&&!r.contains(c.target)&&!n.contains(c.target)&&d()}),{open:p,close:d,getUnreadCount:()=>O(e.slug,i),getButton:()=>n}}function de(e,t){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">What's new</p>
      </div>
      <button class="fb-close" aria-label="Close">${ie}</button>
    </div>
    <div class="fb-cl-body">
      <div class="fb-loading">Loading...</div>
    </div>
    <div class="fb-window-footer">
      <a href="${y(t)}/${y(e.slug)}/changelog" target="_blank" rel="noopener">View all updates →</a>
    </div>
  `}function M(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function y(e){return e.replace(/"/g,"&quot;")}function fe(e){try{return new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric"})}catch(t){return""}}const be="84px",pe='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',ue='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function ge(e,t,o){var g;const a=t==="bottom-left"?"fb-left":"fb-right";let i=!1,s=!1;const n=document.createElement("button");n.className=`fb-btn-float ${a}`,n.setAttribute("aria-label","Roadmap"),n.innerHTML=pe,n.style.bottom=be;const r=document.createElement("div");r.className=`fb-window ${a}`,r.setAttribute("data-fb-theme","dark"),r.style.cssText="height:580px;bottom:88px",r.innerHTML=me(),document.body.appendChild(r),document.body.appendChild(n);function p(){i=!0,r.classList.add("fb-open"),s||(s=!0,u())}function d(){i=!1,r.classList.remove("fb-open")}async function u(){const f=r.querySelector(".fb-window-body");if(!f)return;const c=await K(e.slug);if(!c){f.innerHTML='<div class="fb-empty">Could not load roadmap.</div>';return}f.innerHTML=xe(c)}return n.addEventListener("click",()=>{i?d():p()}),(g=r.querySelector(".fb-close"))==null||g.addEventListener("click",d),{open:p,close:d,getButton:()=>n}}function me(e){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">Roadmap</p>
      </div>
      <button class="fb-close" aria-label="Close">${ue}</button>
    </div>
    <div class="fb-window-body">
      <div class="fb-loading">Loading roadmap...</div>
    </div>
  `}function xe(e){const t=(o,a)=>`
    <div class="fb-kanban-col">
      <p class="fb-kanban-col-title">
        ${q(o)}
        <span class="fb-kanban-col-count">${a.length}</span>
      </p>
      ${a.length===0?'<div style="font-size:11px;color:var(--fb-text-muted);padding:8px 0">Nothing here yet</div>':a.map(i=>`
          <div class="fb-kanban-card">
            <p class="fb-kanban-card-title">${q(i.title)}</p>
            ${i.votes>0?`<span class="fb-kanban-card-votes">▲ ${i.votes}</span>`:""}
          </div>
        `).join("")}
    </div>
  `;return`
    <div class="fb-kanban">
      ${t("Planned",e.planned)}
      ${t("In Progress",e.inProgress)}
      ${t("Done",e.done)}
    </div>
  `}function q(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}let N=!1,$=null,k="";const m={feedback:null,changelog:null,roadmap:null};async function he(e){var d,u;if(N)return;N=!0;const{org:t,theme:o="auto",position:a="bottom-right",accentColor:i}=e,s=document.currentScript,n=(d=s==null?void 0:s.src)!=null?d:"";try{k=new URL(n).origin}catch(g){k=window.location.origin}U(k);const r=await D(t);if(!r){console.warn("[Freebase] Could not load org config for:",t);return}$=r;const p=(u=i!=null?i:r.accentColor)!=null?u:"#10b981";G(p),o!=="auto"&&document.documentElement.setAttribute("data-fb-theme",o),m.feedback=ne(r,a),m.changelog=ce(r,a,k),m.roadmap=ge(r,a)}async function we(e){if(!$)return;const t=await W($.slug,e.jwt);t!=null&&t.token?z(t.token):z(e.jwt)}function ve(e){var t,o,a;e==="feedback"&&((t=m.feedback)==null||t.open()),e==="changelog"&&((o=m.changelog)==null||o.open()),e==="roadmap"&&((a=m.roadmap)==null||a.open())}function ye(e){m.changelog?e(m.changelog.getUnreadCount()):e(0)}async function H(e,...t){switch(e){case"init":await he(t[0]);break;case"identify":await we(t[0]);break;case"open":ve(t[0]);break;case"getUnreadCount":ye(t[0]);break;default:console.warn("[Freebase] Unknown command:",e)}}function j(){var a;const e=window.Freebase,t=(a=e==null?void 0:e.q)!=null?a:[],o=(...i)=>{H(i[0],...i.slice(1))};window.Freebase=o;for(const i of t)H(i[0],...i.slice(1))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",j):j()})();
