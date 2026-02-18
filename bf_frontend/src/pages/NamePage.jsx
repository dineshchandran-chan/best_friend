import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveName } from "../api";


export default function NamePage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

 async function onSave() {
  const n = name.trim();
  if (!n) return;

  setSaving(true);
  try {
    await saveName(n);
    localStorage.setItem("bf_her_name", n);
    nav("/quiz");
  } finally {
    setSaving(false);
  }
}


  return (
    <div className="page heartsBg">
      <div className="card glass">
        <div className="badge">💗 Hello cutie</div>
        <h1 className="title">Type your name</h1>
        <p className="muted">Just a tiny thing before we start 😄</p>

        <div className="row">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
          />
          <button className="btn primary" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <p className="tiny muted">Made with 💖</p>
      </div>
    </div>
  );
}
