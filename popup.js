function fmt(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

async function render() {
  const root = document.getElementById("notes");
  root.innerHTML = "";
  const { notes = [] } = await chrome.storage.local.get(["notes"]);
  if (!notes.length) {
    root.innerHTML = `<div class="muted">No notes yet. Select text on any page → click “Save”.</div>`;
    return;
  }
  notes.forEach(n => {
    const el = document.createElement("div");
    el.className = "note";
    el.innerHTML = `<div>${n.text}</div><div class="muted">${fmt(n.savedAt)}</div>`;
    root.appendChild(el);
  });
}

document.getElementById("clear").addEventListener("click", async () => {
  await chrome.storage.local.set({ notes: [] });
  render();
});

render();
