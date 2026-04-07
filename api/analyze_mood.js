// api/analyze_mood.js
// Vercel Serverless Function — replaces analyze_mood.php
// The GEMINI_API_KEY is set in Vercel's Environment Variables dashboard (never committed to Git).

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body || {};
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Missing text to analyze' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured. Set GEMINI_API_KEY in Vercel Environment Variables.' });
    }

    const model = 'gemini-2.5-flash-lite';
    const prompt = `Analyze the following text and categorize the mood into exactly one of these six categories: "happy", "sad", "energetic", "chill", "romantic", or "nostalgic". Reply with ONLY the exact single word, no punctuation, no explanation.\n\nText: "${text.trim()}"`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            })
        });

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            const msg = data?.error?.message || `Gemini API error (HTTP ${geminiRes.status})`;
            return res.status(geminiRes.status).json({ error: msg });
        }

        let mood = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').toLowerCase().trim();

        const valid = ['happy', 'sad', 'energetic', 'chill', 'romantic', 'nostalgic'];
        if (!valid.includes(mood)) {
            mood = valid.find(v => mood.includes(v)) || 'chill';
        }

        return res.status(200).json({ mood });

    } catch (err) {
        return res.status(502).json({ error: 'Could not reach Gemini API: ' + err.message });
    }
}