const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyh0ky_jBjnvpAMd_2KAM_qCJP8bYjEyszFmMFN5JrdStwX712mFl6tvSgpPPWMdgynlQ/exec";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    let text;

    if (req.method === "GET") {
      const params = new URLSearchParams(req.query).toString();
      const r = await fetch(`${SCRIPT_URL}?${params}`, { redirect: "follow" });
      text = await r.text();
    } else {
      // Send POST data as GET with encoded payload — avoids Google's POST restrictions
      const payload = encodeURIComponent(JSON.stringify(req.body));
      const r = await fetch(`${SCRIPT_URL}?method=POST&payload=${payload}`, { redirect: "follow" });
      text = await r.text();
    }

    if (!text || text.trim().startsWith("<")) {
      return res.status(502).json({ error: "Apps Script error" });
    }

    return res.status(200).json(JSON.parse(text));

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
