import { useState, useEffect } from "react";

const TONES = [
  { value: "formal", label: "Formal", icon: "👔", desc: "Professional & respectful" },
  { value: "friendly", label: "Friendly", icon: "😊", desc: "Warm & approachable" },
  { value: "apologetic", label: "Apologetic", icon: "🙏", desc: "Sorry & solution-focused" },
];

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "हिंदी" },
];

const QUICK_INSTRUCTIONS = [
  { label: "❌ Can't extend deadline", text: "We cannot extend the deadline under any circumstances. Politely decline but offer alternative support." },
  { label: "✅ Approve refund", text: "Approve the refund request. Assure them it will be processed in 5–7 business days." },
  { label: "⏳ Need more time", text: "We need 2 more days to resolve this. Ask for their patience and assure them we are working on it." },
  { label: "🔁 Escalate to manager", text: "This issue will be escalated to our manager. Ask them to expect a call within 24 hours." },
  { label: "📦 Order is delayed", text: "Their order is delayed by 3 days due to supply issues. Apologise and give revised date." },
  { label: "💰 No discount available", text: "We cannot offer any additional discount at this time. Politely decline but thank them for their loyalty." },
];

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: "#5A4A8A",
  display: "block", marginBottom: 6,
  letterSpacing: "0.04em", textTransform: "uppercase",
};

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #DDD8F5", background: "#fff",
  fontSize: 14, color: "#1A0F3C", outline: "none",
  boxSizing: "border-box",
};

export default function App() {
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [tone, setTone] = useState("formal");
  const [language, setLanguage] = useState("English");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  }

  async function generateReply() {
    if (!email.trim()) { setError("Please paste a customer email first."); return; }
    if (!instructions.trim()) { setError("Please add your instructions — what should the reply say?"); return; }
    setError("");
    setLoading(true);
    setReply("");

    const prompt = `You are an AI assistant helping a business reply to customer emails.

Business name: ${businessName || "Our Business"}
Tone: ${tone}
Reply language: ${language}

Customer email:
"""
${email}
"""

Business owner's instructions (STRICTLY follow this — this is what the business has decided):
"""
${instructions}
"""

Write a ${tone} reply email in ${language} that strictly follows the business owner's instructions above.
- The reply must reflect the owner's decision exactly — do not change the outcome
- Keep it concise (3–5 sentences), professional, and human
- Start with a greeting, address their concern, end with a polite closing
- Do NOT include a subject line
- Only output the email body, nothing else`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("No reply generated");
      setReply(text.trim());
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function copyReply() {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6FF", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {showInstallBanner && !installed && (
        <div style={{ background: "linear-gradient(135deg, #7C5CFC, #5B3FD4)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>📲 Install ReplyAI on your phone or laptop!</div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={handleInstall} style={{ background: "#fff", color: "#5B3FD4", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Install</button>
            <button onClick={() => setShowInstallBanner(false)} style={{ background: "transparent", color: "#fff", border: "none", fontSize: 16, cursor: "pointer" }}>✕</button>
          </div>
        </div>
      )}

      {installed && (
        <div style={{ background: "#E1F5EE", padding: "8px 16px", textAlign: "center", fontSize: 12, color: "#085041", fontWeight: 500 }}>
          ✅ ReplyAI is installed on this device!
        </div>
      )}

      <div style={{ background: "#1A0F3C", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7C5CFC, #B490FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✉️</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>ReplyAI</div>
            <div style={{ color: "#9B8FCC", fontSize: 11 }}>Smart email replies — on your terms</div>
          </div>
        </div>
        {!installed && installPrompt && (
          <button onClick={handleInstall} style={{ background: "transparent", border: "1px solid #7C5CFC", color: "#B490FF", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
            📲 Install App
          </button>
        )}
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 40px" }}>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Your Business Name</label>
          <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Sharma Electronics, City Clinic..." style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Paste Customer Email</label>
          <textarea value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="Paste the customer's email here..." rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            Your Instructions to AI
            <span style={{ background: "#7C5CFC", color: "#fff", fontSize: 10, padding: "1px 7px", borderRadius: 6, marginLeft: 8, fontWeight: 600 }}>KEY</span>
          </label>
          <div style={{ background: "#fff", border: "2px solid #7C5CFC", borderRadius: 12, overflow: "hidden" }}>
            <textarea value={instructions} onChange={e => { setInstructions(e.target.value); setError(""); }}
              placeholder={`Tell AI what to say...\n\nExample: "We cannot extend the deadline. Politely decline but offer a call."`}
              rows={4} style={{ width: "100%", padding: "12px 14px", border: "none", background: "transparent", fontSize: 14, color: "#1A0F3C", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }} />
            <div style={{ borderTop: "1px solid #EDE9FF", padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#8B80B8", marginBottom: 7, fontWeight: 600 }}>QUICK FILL:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {QUICK_INSTRUCTIONS.map((q, i) => (
                  <button key={i} onClick={() => setInstructions(q.text)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: "1px solid #DDD8F5", background: instructions === q.text ? "#EDE9FF" : "#F7F6FF", color: instructions === q.text ? "#5B3FD4" : "#5A4A8A", cursor: "pointer", fontWeight: 500 }}>{q.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#8B80B8", marginTop: 5 }}>💡 AI follows your instructions exactly — your decision, AI makes it professional.</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Reply Tone</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {TONES.map(t => (
              <button key={t.value} onClick={() => setTone(t.value)} style={{ padding: "10px 8px", borderRadius: 10, cursor: "pointer", border: tone === t.value ? "2px solid #7C5CFC" : "1.5px solid #DDD8F5", background: tone === t.value ? "#EDE9FF" : "#fff", textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: tone === t.value ? "#5B3FD4" : "#1A0F3C" }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "#8B80B8" }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Reply Language</label>
          <div style={{ display: "flex", gap: 8 }}>
            {LANGUAGES.map(l => (
              <button key={l.value} onClick={() => setLanguage(l.value)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer", border: language === l.value ? "2px solid #7C5CFC" : "1.5px solid #DDD8F5", background: language === l.value ? "#EDE9FF" : "#fff", fontSize: 14, fontWeight: 600, color: language === l.value ? "#5B3FD4" : "#1A0F3C" }}>{l.label}</button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ color: "#F04438", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#FFF1F0", borderRadius: 8, border: "1px solid #FECDCA" }}>⚠️ {error}</div>
        )}

        <button onClick={generateReply} disabled={loading} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: loading ? "#B3A5E8" : "linear-gradient(135deg, #7C5CFC, #5B3FD4)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> Generating...</> : "✨ Generate Reply"}
        </button>

        {reply && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #DDD8F5", overflow: "hidden", boxShadow: "0 2px 12px rgba(124,92,252,0.08)" }}>
            <div style={{ background: "#1A0F3C", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#B490FF", fontSize: 12, fontWeight: 600 }}>✉ GENERATED REPLY</div>
              <button onClick={copyReply} style={{ background: copied ? "#12B76A" : "#7C5CFC", color: "#fff", border: "none", borderRadius: 7, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{copied ? "✓ Copied!" : "Copy"}</button>
            </div>
            <div style={{ padding: "16px 18px", fontSize: 14, color: "#2D1F5E", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{reply}</div>
            <div style={{ borderTop: "1px solid #F0ECFF", padding: "10px 18px", display: "flex", gap: 8 }}>
              <button onClick={generateReply} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid #DDD8F5", background: "#F7F6FF", fontSize: 13, color: "#5B3FD4", fontWeight: 500, cursor: "pointer" }}>↺ Regenerate</button>
              <button onClick={() => { setReply(""); setEmail(""); setInstructions(""); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid #DDD8F5", background: "#F7F6FF", fontSize: 13, color: "#8B80B8", fontWeight: 500, cursor: "pointer" }}>+ New Email</button>
            </div>
          </div>
        )}

        {!reply && !loading && (
          <div style={{ textAlign: "center", padding: "32px 20px", background: "#fff", borderRadius: 14, border: "1.5px dashed #DDD8F5" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📬</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#5A4A8A", marginBottom: 4 }}>No reply generated yet</div>
            <div style={{ fontSize: 12, color: "#9B8FCC" }}>Paste an email, add your instructions, then hit Generate</div>
          </div>
        )}

        {!installed && (
          <div style={{ marginTop: 24, background: "#fff", borderRadius: 12, border: "1px solid #DDD8F5", padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A0F3C", marginBottom: 10 }}>📲 How to install this app</div>
            <div style={{ fontSize: 12, color: "#5A4A8A", lineHeight: 1.8 }}>
              <div style={{ marginBottom: 6, padding: "6px 10px", background: "#F7F6FF", borderRadius: 8 }}><strong>Android:</strong> Tap 3-dot menu in Chrome → "Add to Home Screen" → Install</div>
              <div style={{ marginBottom: 6, padding: "6px 10px", background: "#F7F6FF", borderRadius: 8 }}><strong>iPhone:</strong> Tap Share in Safari → "Add to Home Screen" → Add</div>
              <div style={{ padding: "6px 10px", background: "#F7F6FF", borderRadius: 8 }}><strong>Laptop:</strong> Click install icon in Chrome address bar → Install</div>
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } * { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
