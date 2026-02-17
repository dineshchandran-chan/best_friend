import { useEffect, useState } from "react";

export default function App() {
  const [msg, setMsg] = useState("Loading...");
  const [name, setName] = useState("machi");

  const API = import.meta.env.VITE_API_URL;

  async function fetchHello() {
    try {
      const res = await fetch(`${API}/api/hello?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      setMsg(data.message);
    } catch (e) {
      setMsg("API error: " + e.message);
    }
  }

  useEffect(() => {
    fetchHello();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h2>Best Friend (React + FastAPI)</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          style={{ padding: 8, width: 240 }}
        />
        <button onClick={fetchHello} style={{ padding: 8, marginLeft: 10 }}>
          Call API
        </button>
      </div>

      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        {msg}
      </div>
    </div>
  );
}
