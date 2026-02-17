from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Best Friend API")

# Allow React dev + deployed sites (for now allow all to keep simple)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/hello")
def hello(name: str = "machi"):
    return {"message": f"Hello {name} 👋 from FastAPI"}
