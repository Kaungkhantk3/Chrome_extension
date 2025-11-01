# 🧠 AI Context Highlighter — Chrome Extension

**AI Context Highlighter** helps you instantly understand any text on the web.  
Highlight a sentence or phrase, and get **AI-powered summaries**, **definitions**, or **Wikipedia explanations** — all without leaving the page.

---

## 🚀 Features

- 🧠 **AI Summary** — concise explanations generated securely via a Cloudflare Worker + OpenAI API
- 📚 **Explain / Define** — uses trusted public sources like Wikipedia and DictionaryAPI
- 📋 **Copy / Save Notes** — store key highlights locally (no account needed)
- ⚙️ **Clean UI** — lightweight bubble overlay and popup for saved notes
- 🔒 **Privacy First** — no tracking, analytics, or personal data collection

---

## 🧩 How It Works

1. Highlight text on any webpage.
2. A small action bubble appears with options: **AI**, **Explain**, **Define**, **Copy**, or **Save**.
3. Click one to view instant results in a floating panel.
4. Saved notes appear in the extension’s popup panel.

---

## 🧰 Tech Stack

- **Languages:** HTML, CSS, JavaScript
- **Backend:** Cloudflare Worker (serverless proxy for OpenAI API)
- **APIs:**
  - Wikipedia REST API
  - DictionaryAPI.dev
  - OpenAI (via Worker)
- **Chrome APIs:** `activeTab`, `scripting`, `storage`, `host_permissions`

---
