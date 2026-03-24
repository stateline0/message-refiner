export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt, secret } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  if (!secret || secret !== process.env.SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const result = (data.content || []).map(b => b.text || "").join("");
    return res.status(200).json({ result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
