const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIrc3Oj3ZyQxiPN8amhjbbwk89lr_bQAIVt9cpq8Ua6pgELxbk-Ay9gDRcixE-y-nH-Q/exec";

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    let response;

    if (req.method === "GET") {
      const params = new URLSearchParams(req.query).toString();
      response = await fetch(`${SCRIPT_URL}?${params}`, { redirect: "follow" });
    } else {
      const bodyStr = JSON.stringify(req.body);
      response = await fetch(SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: bodyStr,
      });
    }

    const text = await response.text();

    // Apps Script returned an HTML error page
    if (text.trim().startsWith("<")) {
      console.error("Got HTML from Apps Script:", text.substring(0, 300));
      return res.status(502).json({ error: "Apps Script returned HTML — redeploy with Execute As: Me and Access: Anyone" });
    }

    try {
      return res.status(200).json(JSON.parse(text));
    } catch (e) {
      return res.status(502).json({ error: "Bad response: " + text.substring(0, 100) });
    }

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}
