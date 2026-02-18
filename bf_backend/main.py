from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import uuid
from datetime import datetime

app = FastAPI(title="BestFriend Love Quiz API")

# ✅ CORS (for Vercel / local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # you can restrict later
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (simple). For real app, use DB.
SESSIONS: Dict[str, Dict[str, Any]] = {}

# --- Models ---
class StartSessionResponse(BaseModel):
    session_id: str

class SaveNameBody(BaseModel):
    name: str

class AnswerBody(BaseModel):
    question_id: str
    selected: str
    is_correct: bool

class FinishBody(BaseModel):
    finished: bool = True

# --- Helpers ---
def get_session_or_404(session_id: str) -> Dict[str, Any]:
    if session_id not in SESSIONS:
        # auto create if not exists (simple)
        SESSIONS[session_id] = {
            "created_at": datetime.utcnow().isoformat(),
            "name": None,
            "answers": [],
            "finished": False,
        }
    return SESSIONS[session_id]

# --- Routes ---
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/session/start", response_model=StartSessionResponse)
def start_session():
    sid = str(uuid.uuid4())
    SESSIONS[sid] = {
        "created_at": datetime.utcnow().isoformat(),
        "name": None,
        "answers": [],
        "finished": False,
    }
    return {"session_id": sid}

@app.post("/api/session/{session_id}/name")
def save_name(session_id: str, body: SaveNameBody):
    s = get_session_or_404(session_id)
    s["name"] = body.name.strip()
    return {"ok": True, "session_id": session_id, "name": s["name"]}

@app.post("/api/session/{session_id}/answer")
def save_answer(session_id: str, body: AnswerBody):
    s = get_session_or_404(session_id)
    s["answers"].append({
        "ts": datetime.utcnow().isoformat(),
        "question_id": body.question_id,
        "selected": body.selected,
        "is_correct": body.is_correct,
    })
    return {"ok": True, "answers_count": len(s["answers"])}

@app.post("/api/session/{session_id}/finish")
def finish(session_id: str, body: FinishBody):
    s = get_session_or_404(session_id)
    s["finished"] = bool(body.finished)
    return {"ok": True, "finished": s["finished"]}

@app.get("/api/session/{session_id}")
def get_session(session_id: str):
    s = get_session_or_404(session_id)
    return {"session_id": session_id, **s}
