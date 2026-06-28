(function(){"use strict";let $=null,E="";function R(e){E=e}function z(e){$=e}function D(e){const t={"Content-Type":"application/json",...e};return $&&(t["X-Freebase-User"]=$),t}async function k(e,t={}){try{const o=await fetch(`${E}${e}`,{...t,headers:D(t.headers)});return o.ok?o.json():null}catch(o){return null}}async function W(e){return k(`/api/widget/${e}/config`)}async function J(e,t){return k(`/api/widget/${e}/identify`,{method:"POST",body:JSON.stringify({jwt:t})})}async function K(e){var o;const t=await k(`/api/v1/orgs/${e}/changelog?status=published&limit=5`);return(o=t==null?void 0:t.data)!=null?o:[]}async function Y(e){return k(`/api/v1/orgs/${e}/roadmap`)}async function G(e,t){return await k(`/api/v1/orgs/${e}/posts`,{method:"POST",body:JSON.stringify(t)})!==null}function X(e){const t="freebase-styles";if(document.getElementById(t))return;const o=document.createElement("style");o.id=t,o.textContent=V(e),document.head.appendChild(o)}function V(e){return`
:root {
  --fb-accent: ${e};
  --fb-accent-hover: ${Z(e)};
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
`}function Z(e){const t=parseInt(e.replace("#",""),16),o=Math.max(0,(t>>16&255)-25),i=Math.max(0,(t>>8&255)-25),a=Math.max(0,(t&255)-25);return`#${(o<<16|i<<8|a).toString(16).padStart(6,"0")}`}const Q="24px",ee='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',te='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',ne='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';function oe(e,t,o,i=()=>{}){var l;const a={open:!1,submitting:!1,success:!1},f=t==="bottom-left"?"fb-left":"fb-right",r=document.createElement("button");r.className=`fb-btn-float ${f}`,r.setAttribute("aria-label","Submit feedback"),r.innerHTML=ee,r.style.bottom=Q;const n=document.createElement("div");n.className=`fb-window ${f}`,n.setAttribute("data-fb-theme","dark"),n.style.cssText="height:560px;bottom:88px",n.innerHTML=ae(e),document.body.appendChild(n),document.body.appendChild(r);function b(){i(),a.open=!0,n.classList.add("fb-open")}function p(){a.open=!1,n.classList.remove("fb-open")}function u(){a.success=!1;const c=n.querySelector(".fb-window-body");c&&(c.innerHTML=T(e)),x()}function x(){const c=n.querySelector("#fb-feedback-form");c&&c.addEventListener("submit",async d=>{var P,F,U;if(d.preventDefault(),a.submitting)return;const s=n.querySelector("#fb-title"),g=n.querySelector("#fb-desc"),v=n.querySelector("#fb-email"),L=n.querySelector("#fb-category"),y=n.querySelector(".fb-error"),h=n.querySelector("#fb-submit"),I=(P=s==null?void 0:s.value.trim())!=null?P:"",Ce=(g==null?void 0:g.value.trim())||void 0,_=(F=v==null?void 0:v.value.trim())!=null?F:"",$e=(L==null?void 0:L.value)||void 0;if(I.length<5){y&&(y.textContent="Title must be at least 5 characters.");return}if(!_){y&&(y.textContent="Email is required.");return}a.submitting=!0,h&&(h.disabled=!0),h&&(h.textContent="Submitting...");const Se=await G(e.slug,{title:I,description:Ce,categoryId:$e,authorEmail:_});if(a.submitting=!1,!Se){h&&(h.disabled=!1),h&&(h.textContent="Submit"),y&&(y.textContent="Failed to submit. Please try again.");return}a.success=!0;const A=n.querySelector(".fb-window-body");A&&(A.innerHTML=`
          <div class="fb-success">
            <div class="fb-success-icon">${ne}</div>
            <div>
              <p style="font-weight:600;margin:0 0 4px;color:var(--fb-text)">Thanks for the feedback!</p>
              <p style="margin:0;font-size:13px">We'll review it shortly.</p>
            </div>
            <button id="fb-reset" style="background:none;border:1px solid var(--fb-border);border-radius:var(--fb-radius);padding:6px 14px;color:var(--fb-text-secondary);font-size:12px;cursor:pointer;font-family:inherit">Submit another</button>
          </div>
        `,(U=n.querySelector("#fb-reset"))==null||U.addEventListener("click",u))})}return r.addEventListener("click",()=>{a.open?p():b()}),(l=n.querySelector(".fb-close"))==null||l.addEventListener("click",p),document.addEventListener("click",c=>{a.open&&!n.contains(c.target)&&!r.contains(c.target)&&p()}),document.addEventListener("keydown",c=>{c.key==="Escape"&&a.open&&p()}),x(),{open:b,close:p,getButton:()=>r}}function ae(e){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">Submit Feedback</p>
      </div>
      <button class="fb-close" aria-label="Close">${te}</button>
    </div>
    <div class="fb-window-body">
      ${T(e)}
    </div>
  `}function T(e){const t=e.categories.map(o=>`<option value="${ie(o.id)}">${re(o.name)}</option>`).join("");return`
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
  `}function re(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ie(e){return e.replace(/"/g,"&quot;")}const se='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',O="freebase_cl_read_";function le(e){try{const t=localStorage.getItem(`${O}${e}`);return t?JSON.parse(t):[]}catch(t){return[]}}function ce(e,t){try{localStorage.setItem(`${O}${e}`,JSON.stringify(t))}catch(o){}}function M(e,t){const o=new Set(le(e));return t.filter(i=>!o.has(i.id)).length}function de(e,t,o,i=()=>{}){var c;const a=t==="bottom-left"?"fb-left":"fb-right";let f=[],r=!1;const n=document.createElement("button");n.className=`fb-btn-whats-new ${a}`,n.setAttribute("aria-label","What's new"),n.innerHTML="<span>What's new</span>";const b=document.createElement("div");b.className=`fb-window ${a}`,b.setAttribute("data-fb-theme","dark"),b.style.cssText="height:500px;bottom:88px",b.innerHTML=fe(e,o),document.body.appendChild(b),document.body.appendChild(n);function p(){i(),r=!0,b.classList.add("fb-open"),ce(e.slug,f.map(d=>d.id)),x(0)}function u(){r=!1,b.classList.remove("fb-open")}function x(d){let s=n.querySelector(".fb-badge");d>0?(s||(s=document.createElement("span"),s.className="fb-badge",n.appendChild(s)),s.textContent=String(d)):s==null||s.remove()}function l(d){const s=b.querySelector(".fb-cl-body");if(s){if(d.length===0){s.innerHTML='<div class="fb-empty">No updates yet.</div>';return}s.innerHTML=d.map(g=>`
      <div class="fb-cl-item" data-slug="${C(g.slug)}">
        <p class="fb-cl-item-title">${q(g.title)}</p>
        <div class="fb-cl-item-meta">
          <span class="fb-cl-label fb-cl-label-${C(g.label)}">${q(g.label)}</span>
          <span>${be(g.publishedAt)}</span>
        </div>
      </div>
    `).join(""),s.querySelectorAll(".fb-cl-item").forEach(g=>{g.addEventListener("click",()=>{const v=g.getAttribute("data-slug");v&&window.open(`${o}/${e.slug}/changelog/${v}`,"_blank")})})}}return K(e.slug).then(d=>{f=d,l(f);const s=M(e.slug,f);x(s)}),n.addEventListener("click",()=>{r?u():p()}),(c=b.querySelector(".fb-close"))==null||c.addEventListener("click",u),document.addEventListener("click",d=>{r&&!b.contains(d.target)&&!n.contains(d.target)&&u()}),document.addEventListener("keydown",d=>{d.key==="Escape"&&r&&u()}),{open:p,close:u,getUnreadCount:()=>M(e.slug,f),getButton:()=>n}}function fe(e,t){return`
    <div class="fb-window-header">
      <div class="fb-window-title-row">
        <span class="fb-window-dot"></span>
        <p class="fb-window-title">What's new</p>
      </div>
      <button class="fb-close" aria-label="Close">${se}</button>
    </div>
    <div class="fb-cl-body">
      <div class="fb-loading">Loading...</div>
    </div>
    <div class="fb-window-footer">
      <a href="${C(t)}/${C(e.slug)}/changelog" target="_blank" rel="noopener">View all updates →</a>
    </div>
  `}function q(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function C(e){return e.replace(/"/g,"&quot;")}function be(e){try{return new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric"})}catch(t){return""}}const pe="84px",ue='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',ge='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';function me(e,t,o,i=()=>{}){var x;const a=t==="bottom-left"?"fb-left":"fb-right";let f=!1;const r=document.createElement("button");r.className=`fb-btn-float ${a}`,r.setAttribute("aria-label","Roadmap"),r.innerHTML=ue,r.style.bottom=pe;const n=document.createElement("div");n.className=`fb-window ${a}`,n.setAttribute("data-fb-theme","dark"),n.style.cssText="height:580px;bottom:88px",n.innerHTML=xe(),document.body.appendChild(n),document.body.appendChild(r);function b(){i(),f=!0,n.classList.add("fb-open"),u()}function p(){f=!1,n.classList.remove("fb-open")}async function u(){const l=n.querySelector(".fb-window-body");if(!l)return;const c=await Y(e.slug);if(!c){l.innerHTML='<div class="fb-empty">Could not load roadmap.</div>';return}l.innerHTML=he(c)}return r.addEventListener("click",()=>{f?p():b()}),(x=n.querySelector(".fb-close"))==null||x.addEventListener("click",p),document.addEventListener("click",l=>{f&&!n.contains(l.target)&&!r.contains(l.target)&&p()}),document.addEventListener("keydown",l=>{l.key==="Escape"&&f&&p()}),{open:b,close:p,getButton:()=>r}}function xe(e){return`
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
  `}function he(e){const t=(o,i)=>`
    <div class="fb-kanban-col">
      <p class="fb-kanban-col-title">
        ${N(o)}
        <span class="fb-kanban-col-count">${i.length}</span>
      </p>
      ${i.length===0?'<div style="font-size:11px;color:var(--fb-text-muted);padding:8px 0">Nothing here yet</div>':i.map(a=>`
          <div class="fb-kanban-card">
            <p class="fb-kanban-card-title">${N(a.title)}</p>
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
  `}function N(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}let H=!1,S=null,w="";const m={feedback:null,changelog:null,roadmap:null};async function we(e){var u,x;if(H)return;H=!0;const{org:t,theme:o="auto",position:i="bottom-right",accentColor:a}=e,f=document.currentScript,r=(u=f==null?void 0:f.src)!=null?u:"";try{w=new URL(r).origin}catch(l){w=window.location.origin}R(w);const n=await W(t);if(!n){console.warn("[Freebase] Could not load org config for:",t);return}S=n;const b=(x=a!=null?a:n.accentColor)!=null?x:"#10b981";X(b),o!=="auto"&&document.documentElement.setAttribute("data-fb-theme",o);function p(l){var c,d,s;l!=="feedback"&&((c=m.feedback)==null||c.close()),l!=="changelog"&&((d=m.changelog)==null||d.close()),l!=="roadmap"&&((s=m.roadmap)==null||s.close())}m.feedback=oe(n,i,w,()=>p("feedback")),m.changelog=de(n,i,w,()=>p("changelog")),m.roadmap=me(n,i,w,()=>p("roadmap"))}async function ve(e){if(!S)return;const t=await J(S.slug,e.jwt);t!=null&&t.token?z(t.token):z(e.jwt)}function ye(e){var t,o,i;e==="feedback"&&((t=m.feedback)==null||t.open()),e==="changelog"&&((o=m.changelog)==null||o.open()),e==="roadmap"&&((i=m.roadmap)==null||i.open())}function ke(e){m.changelog?e(m.changelog.getUnreadCount()):e(0)}async function j(e,...t){switch(e){case"init":await we(t[0]);break;case"identify":await ve(t[0]);break;case"open":ye(t[0]);break;case"getUnreadCount":ke(t[0]);break;default:console.warn("[Freebase] Unknown command:",e)}}function B(){var i;const e=window.Freebase,t=(i=e==null?void 0:e.q)!=null?i:[],o=(...a)=>{j(a[0],...a.slice(1))};window.Freebase=o;for(const a of t)j(a[0],...a.slice(1))}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",B):B()})();
