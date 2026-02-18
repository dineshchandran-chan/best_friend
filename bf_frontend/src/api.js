const API = import.meta.env.VITE_API_URL;

export function getSessionId() {
  return localStorage.getItem("bf_session_id");
}

export async function startSession() {
  const res = await fetch(`${API}/api/session/start`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start session");
  const data = await res.json();
  localStorage.setItem("bf_session_id", data.session_id);
  return data.session_id;
}

export async function ensureSession() {
  let sid = getSessionId();
  if (!sid || sid === "undefined" || sid === "null") {
    sid = await startSession();
  }
  return sid;
}

export async function saveName(name) {
  const sid = await ensureSession();
  const res = await fetch(`${API}/api/session/${sid}/name`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to save name");
  return res.json();
}

export async function saveAnswer({ question_id, selected, is_correct }) {
  const sid = await ensureSession();
  const res = await fetch(`${API}/api/session/${sid}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id, selected, is_correct }),
  });
  if (!res.ok) throw new Error("Failed to save answer");
  return res.json();
}

export async function finishQuiz() {
  const sid = await ensureSession();
  const res = await fetch(`${API}/api/session/${sid}/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ finished: true }),
  });
  if (!res.ok) throw new Error("Failed to finish quiz");
  return res.json();
}
