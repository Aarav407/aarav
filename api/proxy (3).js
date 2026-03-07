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
    let text;

    if (req.method === "GET") {
      const params = new URLSearchParams(req.query).toString();
      const url = `${SCRIPT_URL}?${params}`;
      
      // Follow redirects manually
      let r = await fetch(url, { redirect: "manual" });
      if (r.status === 301 || r.status === 302 || r.status === 303 || r.status === 307 || r.status === 308) {
        const location = r.headers.get("location");
        r = await fetch(location, { redirect: "follow" });
      }
      text = await r.text();

    } else {
      const bodyStr = JSON.stringify(req.body);
      
      // Follow redirects manually for POST too
      let r = await fetch(SCRIPT_URL, {
        method: "POST",
        redirect: "manual",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: bodyStr,
      });
      if (r.status === 301 || r.status === 302 || r.status === 303 || r.status === 307 || r.status === 308) {
        const location = r.headers.get("location");
        r = await fetch(location, {
          method: r.status === 303 ? "GET" : "POST",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: r.status === 303 ? undefined : bodyStr,
        });
      }
      text = await r.text();
    }

    if (text.trim().startsWith("<")) {
      console.error("HTML response:", text.substring(0, 300));
      return res.status(502).json({ error: "Got HTML from Apps Script" });
    }

    return res.status(200).json(JSON.parse(text));

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}
