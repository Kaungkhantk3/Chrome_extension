async function fetchWikipediaSummary(q) {
  const title = encodeURIComponent(q.trim().replace(/\s+/g, " "));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  try {
    const r = await fetch(url, { headers: { "accept": "application/json" } });
    if (!r.ok) return null;
    const data = await r.json();
    return data.extract || data.description || null;
  } catch {
    return null;
  }
}

async function fetchDefinition(q) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const first = data && Array.isArray(data) ? data[0] : null;
    const meaning = first?.meanings?.[0]?.definitions?.[0]?.definition;
    return meaning || null;
  } catch {
    return null;
  }
}


const WORKER_URL = "https://ai-context-highlighter.luke-dev.workers.dev/";

async function fetchAISummary(q, context) {
  try {
    const r = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ selection: q, context })
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.result || null;
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === "explain") {
      const result = await fetchWikipediaSummary(msg.text);
      sendResponse({ result: result || "No summary found." });
    } else if (msg.type === "define") {
      const result = await fetchDefinition(msg.text);
      sendResponse({ result: result || "No definition found." });
    } else if (msg.type === "save") {
      const item = { text: msg.text, savedAt: Date.now() };
      const { notes = [] } = await chrome.storage.local.get(["notes"]);
      notes.unshift(item);
      await chrome.storage.local.set({ notes });
      sendResponse(true);
    } else if (msg.type === "ai_explain") {
      const res = await fetchAISummary(msg.text, msg.context || "");
      sendResponse({ result: res || "No AI summary found." });
    }
  })();
  return true;
});
