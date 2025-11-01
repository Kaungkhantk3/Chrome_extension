# AI Context Highlighter (Chrome Extension)

Select text on any site to get **AI summaries**, **Wikipedia explanations**, **dictionary definitions**, and **one‑click save** to notes.

## Install (Unpacked)
1. Download the ZIP from ChatGPT, extract it.
2. Open Chrome → `chrome://extensions` → enable **Developer mode**.
3. Click **Load unpacked** → select the folder.
4. Select text on any page → a bubble appears → click **AI / Explain / Define / Copy / Save**.

## AI Backend
Deploy the Cloudflare Worker in `/ai-context-worker/worker.js`, set your `OPENAI_API_KEY` secret, deploy, then replace `https://<YOUR_WORKER_URL>/` in `background.js` and `manifest.json`.

## Privacy
Notes are stored locally (`chrome.storage.local`). AI requests send only the selection text (and optional page title/host) to your Worker.
# Chrome_extension
