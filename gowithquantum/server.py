"""FastAPI server for Go With Quantum.

Serves the frontend (web/index.html) and exposes a streaming agent API.

Endpoints
---------
GET  /                       → web/index.html
POST /api/jobs               → start a job, returns {id, status}
GET  /api/jobs/{id}          → current job state (no queue)
GET  /api/jobs/{id}/events   → Server-Sent Events stream of agent progress

Event schema (each line: ``data: <json>\\n\\n``)
------------------------------------------------
{"type": "step_start", "step": int, "title": str, "status": "running"}
{"type": "step_done",  "step": int}
{"type": "step_note",  "step": int, "note": str}
{"type": "tool_result","call_index": int, "ok": bool, "stdout": str, ...}
{"type": "report",     "markdown": str}
{"type": "done"}
{"type": "error",      "message": str}
{"type": "ping"}            ← keepalive, ignored by client
"""

from __future__ import annotations

import asyncio
import json
import threading
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel

from .agent import QuantumAgent

# ── paths ──────────────────────────────────────────────────────────────────────
_ROOT = Path(__file__).parent.parent          # repo root
_HTML = _ROOT / "web" / "index.html"

# ── app ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Go With Quantum", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── in-memory job store ────────────────────────────────────────────────────────
# Production would use a database; for MVP a dict is fine.
_jobs: dict[str, dict[str, Any]] = {}


# ── models ─────────────────────────────────────────────────────────────────────
class JobRequest(BaseModel):
    problem: str
    workspace: str = "default"


# ── routes ─────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def index():
    """Serve the SPA."""
    try:
        html = _HTML.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise HTTPException(500, detail=f"Frontend not found at {_HTML}")
    return HTMLResponse(html)


@app.post("/api/jobs", status_code=201)
async def create_job(body: JobRequest):
    """Start an agent run and return its ID immediately."""
    job_id = uuid.uuid4().hex[:10]
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[dict] = asyncio.Queue()

    _jobs[job_id] = {
        "id": job_id,
        "problem": body.problem,
        "workspace": body.workspace,
        "status": "running",
        "step": 0,
        "report": None,
        "error": None,
        "_queue": queue,
    }

    def _put(event: dict) -> None:
        """Thread-safe enqueue of an SSE event."""
        loop.call_soon_threadsafe(queue.put_nowait, event)

    def _run() -> None:
        """Agent loop — runs in a daemon thread so it doesn't block the server."""
        try:
            agent = QuantumAgent(on_event=_put)
            report = agent.solve(body.problem)
            _jobs[job_id]["report"] = report
            _jobs[job_id]["status"] = "done"
            _put({"type": "report", "markdown": report})
        except Exception as exc:
            _jobs[job_id]["status"] = "failed"
            _jobs[job_id]["error"] = str(exc)
            _put({"type": "error", "message": str(exc)})
        finally:
            _put({"type": "done"})

    thread = threading.Thread(target=_run, daemon=True, name=f"agent-{job_id}")
    thread.start()

    return {"id": job_id, "status": "running"}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    """Return current job state (no event queue)."""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(404, detail="Job not found")
    return {k: v for k, v in job.items() if not k.startswith("_")}


@app.get("/api/jobs/{job_id}/events")
async def job_events(job_id: str):
    """Stream Server-Sent Events for the given job."""
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(404, detail="Job not found")

    queue: asyncio.Queue[dict] = job["_queue"]

    async def _generate():
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=25)
            except asyncio.TimeoutError:
                # Keepalive ping — prevents load-balancer/browser timeout.
                yield "data: {\"type\":\"ping\"}\n\n"
                continue

            yield f"data: {json.dumps(event)}\n\n"

            if event.get("type") == "done":
                break

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable nginx buffering if present
        },
    )
