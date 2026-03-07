const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOf0t3wDkSKnM2Qy3Tnq2JEhwk0t0ywwMNhcX6NsYKkv5wXei77zTTJm7m_6LDfTGjIA/exec";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let response;
    if (req.method === "GET") {
      const params = new URLSearchParams(req.query).toString();
      response = await fetch(`${SCRIPT_URL}?${params}`, {
        method: "GET",
        redirect: "follow",
      });
    } else {
      response = await fetch(SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(req.body),
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
