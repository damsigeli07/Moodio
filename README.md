# MoodiO 🎧

**AI-powered mood-to-music web app.** Tell it how you feel — it detects your mood with Google Gemini AI and streams matching music via the iTunes API.

**Live demo:** _your-vercel-url.vercel.app_

---

## Tech Stack

- **Google Gemini AI** — mood classification from free-text input
- **iTunes Search API** — 30-second audio previews
- **Howler.js** — HTML5 audio playback
- **Vercel Serverless Function** — secure API key proxy (Node.js)
- **Vanilla JavaScript (ES Modules)**, CSS glassmorphism UI, animated waveform

---

## Deploy to Vercel (free, no credit card)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/moodio.git
git push -u origin main
```

### 2. Import on Vercel
1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub** (free)
2. Click **Add New → Project** → import your `moodio` repo
3. Leave all build settings as default → click **Deploy**

### 3. Add your Gemini API key
1. In your Vercel project → **Settings → Environment Variables**
2. Add: `GEMINI_API_KEY` = `your_key_here`
3. Click **Redeploy** (top-right in the Deployments tab)

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com) — no billing required.

---

## Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Create a local env file
echo 'GEMINI_API_KEY=your_key_here' > .env.local

# Run locally (emulates serverless functions)
vercel dev
```

---

## Project Structure

```
moodio/
├── api/
│   └── analyze_mood.js   # Serverless function (Gemini proxy)
├── index.html
├── script.js
├── style.css
├── vercel.json           # Routing: /analyze_mood.php → /api/analyze_mood
└── README.md
```