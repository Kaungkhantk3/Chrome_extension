// DEBUG: show we're alive
console.log("[ACH] content.js loaded");
(() => {
  const id = "achi-debug-toast";
  if (document.getElementById(id)) return;
  const t = document.createElement("div");
  t.id = id;
  t.textContent = "AI Context Highlighter enabled on this page";
  Object.assign(t.style, {
    position: "fixed", right: "16px", top: "16px",
    background: "#0B1020", color: "#E5E7EB",
    padding: "8px 12px", borderRadius: "10px",
    zIndex: 2147483647, fontFamily: "system-ui, sans-serif"
  });
  document.documentElement.appendChild(t);
  setTimeout(() => t.remove(), 1500);
})();

let bubble, panel;
let currentSelection = "";

function ensureBubble() {
  if (bubble) return bubble;
  bubble = document.createElement("div");
  bubble.id = "achi-bubble";
  Object.assign(bubble.style, {
    position: "absolute",
    zIndex: 2147483647,
    display: "none",
    gap: "6px",
    background: "rgba(24,24,27,.95)",
    color: "#E5E7EB",
    border: "1px solid rgba(255,255,255,.1)",
    boxShadow: "0 6px 16px rgba(0,0,0,.25)",
    padding: "6px",
    borderRadius: "10px",
    backdropFilter: "blur(6px)",
  });
  bubble.innerHTML = `
    <button data-action="ai" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:8px">AI</button>
    <button data-action="explain" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:8px">Explain</button>
    <button data-action="define" style="all:unset;cursor:pointer;padding:6px 10px;border-radius:8px">Define</button>
  `;
  bubble.addEventListener("click", (e) => {
    const action = e.target?.dataset?.action;
    if (!action) return;
    showPanel(`Clicked: ${action} on "${currentSelection}"`);
  });
  document.documentElement.appendChild(bubble);
  return bubble;
}

function ensurePanel() {
  if (panel) return panel;
  panel = document.createElement("div");
  panel.id = "achi-panel";
  Object.assign(panel.style, {
    position: "fixed", right: "16px", bottom: "16px",
    maxWidth: "380px", width: "min(90vw, 380px)",
    display: "none", zIndex: 2147483647,
    background: "#0B1020", color: "#E5E7EB",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    padding: "14px 16px 12px 16px", lineHeight: "1.4",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
  });
  panel.innerHTML = `
    <div id="achi-panel-content"></div>
    <button id="achi-close" style="all:unset; cursor:pointer; position:absolute; top:6px; right:10px; font-weight:700; opacity:.8">×</button>
  `;
  panel.querySelector("#achi-close").addEventListener("click", () => {
    panel.style.display = "none";
  });
  document.documentElement.appendChild(panel);
  return panel;
}

function showPanel(text) {
  ensurePanel();
  panel.querySelector("#achi-panel-content").textContent = text;
  panel.style.display = "block";
}

function setBubblePosition(rect) {
  const r = rect || {};
  const x = window.scrollX + (r.left || 0) + (r.width || 0) / 2;
  const y = window.scrollY + (r.top || 0) - 8;
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.transform = "translate(-50%, -100%)";
  bubble.style.display = "flex";
}

// Robust selection trigger across sites/iframes
function onSelectionChange() {
  try {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      if (bubble) bubble.style.display = "none";
      return;
    }
    const text = sel.toString().trim();
    if (!text || text.split(/\s+/).length > 12) {
      if (bubble) bubble.style.display = "none";
      return;
    }
    currentSelection = text;
    const range = sel.getRangeAt(0);
    let rect = range.getBoundingClientRect();
    if ((!rect || (rect.width === 0 && rect.height === 0)) && range.getClientRects().length) {
      rect = range.getClientRects()[0];
    }
    ensureBubble();
    setBubblePosition(rect);
    console.log("[ACH] selectionchange -> bubble shown for:", currentSelection);
  } catch (e) {
    console.warn("[ACH] selection handler error:", e);
  }
}

// Also react on mouseup/keyup for sites that suppress selectionchange
document.addEventListener("selectionchange", onSelectionChange, true);
document.addEventListener("mouseup", onSelectionChange, true);
document.addEventListener("keyup", onSelectionChange, true);

// Hide on scroll
window.addEventListener("scroll", () => { if (bubble) bubble.style.display = "none"; }, { passive: true });
