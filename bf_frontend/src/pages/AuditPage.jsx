import { useEffect, useMemo, useState } from "react";

async function fetchLogs(secretKey) {
  const res = await fetch(`/api/audit/logs?key=${encodeURIComponent(secretKey)}`);
  if (!res.ok) throw new Error("Not allowed or failed");
  return res.json();
}

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [err, setErr] = useState("");

  const secretKey = useMemo(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get("key") || "";
  }, []);

  useEffect(() => {
    if (!secretKey) {
      setErr("Missing key. Use /audit?key=YOUR_SECRET");
      return;
    }
    fetchLogs(secretKey)
      .then((data) => setLogs(data.logs || []))
      .catch(() => setErr("Access denied or server error"));
  }, [secretKey]);

  return (
    <div className="page heartsBg">
      <div className="card glass">
        <div className="badge">🧾 Audit Logs</div>
        <h2 className="title">Answers Log</h2>

        {err && <p className="muted">{err}</p>}

        {!err && (
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table className="auditTable">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Link ID</th>
                  <th>Page</th>
                  <th>Question</th>
                  <th>Selected</th>
                  <th>IP</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.created_at).toLocaleString()}</td>
                    <td>{l.link_id}</td>
                    <td>{l.page}</td>
                    <td>{l.question}</td>
                    <td>{l.selected}</td>
                    <td>{l.ip || "-"}</td>
                    <td style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {l.user_agent || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="tiny muted" style={{ marginTop: 10 }}>
          Open like: <b>/audit?key=YOUR_SECRET</b>
        </p>
      </div>
    </div>
  );
}
