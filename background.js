// ====== CONFIG ======
const WORKER_URL = "https://ai-context-highlighter.luke-dev.workers.dev/"; 

// ====== UTIL: fetch helpers with robust errors ======
async function fetchJSON(url, opts = {}) {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
    return await r.json();
  } catch (e) {
    console.error("[ACH:bg] fetchJSON error:", url, e);
    throw e;
  }
}

async function fetchWikipediaSummary(q) {
  const title = encodeURIComponent(q.trim().replace(/\s+/g, " "));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  try {
    const data = await fetchJSON(url, { headers: { accept: "application/json" } });
    return data.extract || data.description || null;
  } catch {
    return null;
  }
}

async function fetchDefinition(q) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`;
  try {
    const data = await fetchJSON(url);
    const first = Array.isArray(data) ? data[0] : null;
    return first?.meanings?.[0]?.definitions?.[0]?.definition || null;
  } catch {
    return null;
  }
}

async function fetchAISummary(selection, context) {
  if (!WORKER_URL || WORKER_URL.includes("<your-worker>")) {
    console.warn("[ACH:bg] WORKER_URL not set");
    return "AI is not configured yet (Worker URL missing).";
  }
  try {
    const data = await fetchJSON(WORKER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ selection, context })
    });
    return data.result || null;
  } catch (e) {
    // Common causes: CORS, wrong URL, network block
    return `AI request failed: ${String(e.message || e)}`;
  }
}

// ====== MESSAGE HANDLER ======
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      console.log("[ACH:bg] message:", msg);

      if (!msg?.type) return sendResponse({ result: "Bad request." });

      if (msg.type === "save") {
        const item = { text: msg.text || "", savedAt: Date.now() };
        const { notes = [] } = await chrome.storage.local.get(["notes"]);
        notes.unshift(item);
        await chrome.storage.local.set({ notes });
        return sendResponse({ ok: true });
      }

      if (msg.type === "explain") {
        const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent((msg.text||"").trim())}`, {
          headers: { accept: "application/json" }
        });
        let result = "No summary found.";
        if (r.ok) {
          const data = await r.json();
          result = data.extract || data.description || result;
        }
        return sendResponse({ result });
      }

      if (msg.type === "define") {
        const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(msg.text||"")}`);
        let result = "No definition found.";
        if (r.ok) {
          const data = await r.json();
          const first = Array.isArray(data) ? data[0] : null;
          result = first?.meanings?.[0]?.definitions?.[0]?.definition || result;
        }
        return sendResponse({ result });
      }

      if (msg.type === "ai_explain") {
        const WORKER_URL = "https://ai-context-highlighter.luke-dev.workers.dev/"; // 
        if (!WORKER_URL || WORKER_URL.includes("<your-worker>")) {
          return sendResponse({ result: "AI is not configured yet (Worker URL missing)." });
        }
        const r = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ selection: msg.text || "", context: msg.context || "" })
        });
        if (!r.ok) {
          const txt = await r.text();
          console.error("[ACH:bg] AI error:", r.status, txt);
          return sendResponse({ result: `AI request failed (HTTP ${r.status}).` });
        }
        const data = await r.json();
        return sendResponse({ result: data.result || "No AI summary found." });
      }

      console.warn("[ACH:bg] Unknown type:", msg.type);
      sendResponse({ result: "Unknown action." });
    } catch (e) {
      console.error("[ACH:bg] Handler error:", e);
      sendResponse({ result: "Error: " + (e?.message || String(e)) });
    }
  })();
  return true; // keep the message channel open for async
});


// ====== CLICK-TO-INJECT (only if you use activeTab flow) ======
chrome.action?.onClicked.addListener(async (tab) => {
  try {
    if (!tab?.id) return;
    await chrome.scripting.insertCSS({ target: { tabId: tab.id, allFrames: true }, files: ["content.css"] });
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ["content.js"] });
    console.log("[ACH:bg] Injected content scripts into tab", tab.id);
  } catch (e) {
    // Common error: "Cannot access contents of url ..." -> missing host permissions or disallowed page (chrome://)
    console.error("[ACH:bg] Injection failed:", e);
  }
});
