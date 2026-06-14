export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.VITE_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate reply" });
  }
}

Commit changes ✅

Step 2 — Update App.jsx on GitHub:

Find this line in src/App.jsx:
jsconst response = await fetch("https://api.anthropic.com/v1/messages", {
Replace it with:
jsconst response = await fetch("/api/generate", {
And remove these 3 header lines:
js"x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
"anthropic-version": "2023-06-01",
So the headers section becomes just:
jsheaders: {
  "Content-Type": "application/json",
},

