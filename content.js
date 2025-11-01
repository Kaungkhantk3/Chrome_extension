let bubble, panel, currentSelection = "";

// Create the action bubble shown near selection
function createBubble() {
  bubble = document.createElement("div");
  bubble.id = "achi-bubble";
  bubble.innerHTML = `
    <button data-action="ai" aria-label="AI Summary">AI</button>
    <button data-action="explain" aria-label="Explain with Wikipedia">Explain</button>
    <button data-action="define" aria-label="Define the term">Define</button>
    <button data-action="copy" aria-label="Copy selection">Copy</button>
    <button data-action="save" aria-label="Save note">Save</button>
  `;
  document.body.appendChild(bubble);

  bubble.addEventListener("click", async (e) => {
    const action = e.target?.dataset?.action;
    if (!action) return;
    if (action === "copy") {
      navigator.clipboard.writeText(currentSelection).catch(()=>{});
      showPanel("Copied to clipboard.");
    } else if (action === "save") {
      chrome.runtime.sendMessage({ type: "save", text: currentSelection }, (ok) => {
        showPanel(ok ? "Saved to extension notes." : "Save failed.");
      });
    } else if (action === "explain" || action === "define") {
      showPanel("Loading...");
      chrome.runtime.sendMessage(
        { type: action, text: currentSelection },
        (resp) => showPanel(resp?.result || "No result.")
      );
    } else if (action === "ai") {
      showPanel("Thinking with AI…");
      const context = document.title + " | " + location.hostname;
      chrome.runtime.sendMessage({ type: "ai_explain", text: currentSelection, context }, resp => {
        showPanel(resp?.result || "No result.");
      });
    }
  });
}

// Create the bottom-right panel
function createPanel() {
  panel = document.createElement("div");
  panel.id = "achi-panel";
  panel.innerHTML = `
    <div id="achi-panel-content"></div>
    <div style="display:flex; gap:8px; margin-top:10px">
      <button id="achi-copy-result" style="all:unset; cursor:pointer; padding:6px 10px; border:1px solid #394150; border-radius:8px;">Copy Result</button>
    </div>
    <span id="achi-close" aria-label="Close">×</span>
  `;
  document.body.appendChild(panel);
  panel.querySelector("#achi-close").addEventListener("click", () => {
    panel.style.display = "none";
    panel.classList.remove("show");
  });
  panel.querySelector("#achi-copy-result").addEventListener("click", async () => {
    const txt = panel.querySelector("#achi-panel-content").textContent || "";
    try { await navigator.clipboard.writeText(txt); } catch {}
  });
}

function showPanel(text) {
  const content = panel.querySelector("#achi-panel-content");
  content.textContent = text;
  panel.style.display = "block";
  requestAnimationFrame(() => panel.classList.add("show"));
}

function setBubblePosition(rect) {
  const x = window.scrollX + rect.left + rect.width / 2;
  const y = window.scrollY + rect.top - 8;
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.transform = "translate(-50%, -100%)";
  bubble.style.display = "flex";
}

document.addEventListener("selectionchange", () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) { if (bubble) bubble.style.display = "none"; return; }
  const text = sel.toString().trim();
  if (!text || text.split(/\s+/).length > 12) { // limit to short selections for v1 UX
    if (bubble) bubble.style.display = "none";
    return;
  }
  currentSelection = text;
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!bubble) createBubble();
  if (!panel) createPanel();
  // avoid zero-size rects (e.g., hidden selection)
  if (rect && rect.width + rect.height > 0) {
    const x = window.scrollX + rect.left + rect.width / 2;
    const y = window.scrollY + rect.top - 8;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.transform = "translate(-50%, -100%)";
    bubble.style.display = "flex";
  }
});

window.addEventListener("scroll", () => {
  if (bubble) bubble.style.display = "none";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && panel?.style.display === "block") {
    panel.style.display = "none";
    panel.classList.remove("show");
  }
});
