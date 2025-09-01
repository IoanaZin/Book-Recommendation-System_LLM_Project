# backend.py
import os
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# OpenAI SDK v1.x
from openai import OpenAI

# RAG: Chroma + OpenAIEmbeddings (pachet: langchain-openai / langchain-community)
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# Local tool for full summary 
from tools import get_summary_by_title

# ---- DB (SQLModel) ----
from sqlmodel import SQLModel, Field, create_engine, Session, select
from datetime import datetime


# CONFIG

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in environment (.env)")

#models
EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "gpt-4o-mini"
IMAGE_MODEL = "gpt-image-1"

# SQLite for history storage
DB_URL = "sqlite:///smart_librarian.db"
engine = create_engine(DB_URL, echo=False)

# OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

#DB MODELS
class History(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    query: str
    title: str
    short_recommendation: Optional[str] = None
    detailed_summary: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class HistoryCreate(BaseModel):
    query: str
    title: str
    short_recommendation: Optional[str] = None
    detailed_summary: Optional[str] = None

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)



# RAG: Chroma
print(" Loading Chroma vector store...")
embedding_fn = OpenAIEmbeddings(model=EMBEDDING_MODEL, api_key=OPENAI_API_KEY)
# Asigură-te că ai rulat înainte main.py care creează chroma_db
chroma_db = Chroma(persist_directory="chroma_db", embedding_function=embedding_fn)
print(" Chroma loaded.")

#    FASTAPI & CORS
app = FastAPI(title="Smart Librarian API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()



#SCHEMAS (Pydantic)

class Question(BaseModel):
    query: str

class ImageRequest(BaseModel):
    title: str
    theme: Optional[str] = None

# HELPERS
def pick_best_doc(docs) -> Optional[dict]:
    """
    docs: list[Document] din Chroma. Extrage (title, content) din metadata/conținut.
    """
    if not docs:
        return None

    d = docs[0]  # top-1
    title = None
    if hasattr(d, "metadata") and isinstance(d.metadata, dict):
        title = d.metadata.get("title") or d.metadata.get("book_title")

    content = getattr(d, "page_content", "") or ""

    if not title:
    
        lines = content.splitlines()
        for ln in lines[:3]:
            low = ln.lower().strip()
            if low.startswith("## title:"):
                title = ln.split(":", 1)[-1].strip()
                break
            if low.startswith("title:"):
                title = ln.split(":", 1)[-1].strip()
                break

    if not title:
        title = "Unknown title"

    return {"title": title, "content": content}


def llm_short_recommendation(user_query: str, candidate_title: str, context_snippet: str) -> str:
    """
    2–3 sentences in English, without spoilers, explaining why the title matches the request.
    Model: gpt-4o-min
    """
    prompt = f"""
You are a helpful book recommender. A user asked: "{user_query}"

Top match from the RAG vector store is the book: "{candidate_title}".

Context (may be partial):
---
{context_snippet[:1200]}
---

Write a concise recommendation (2–3 sentences, English). Mention the title once and why it fits the user's request.
Avoid spoilers.
"""

    resp = client.chat.completions.create(
        model=LLM_MODEL,
        temperature=0.4,
        messages=[
            {"role": "system", "content": "You recommend books concisely and helpfully."},
            {"role": "user", "content": prompt},
        ],
    )
    return resp.choices[0].message.content.strip()


#ENDPOINTS
@app.get("/health")
def health():
    return {"status": "ok"}


# Recommend
@app.post("/recommend")
def recommend_book(question: Question):
    q = (question.query or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="Empty query.")

    # # 1) semantic search in Chroma
    try:
        docs = chroma_db.similarity_search(q, k=4)
    except Exception as e:
        print(" Chroma search failed:", e)
        raise HTTPException(status_code=500, detail="Vector search failed.")

    picked = pick_best_doc(docs)
    if not picked:
        result = {
            "title": "No match found",
            "short_recommendation": "I couldn’t find a good match. Try wording it differently (e.g., 'friendship and magic', 'war and honor').",
            "detailed_summary": None,
        }
        with get_session() as s:
            s.add(History(
                query=q,
                title=result["title"],
                short_recommendation=result["short_recommendation"],
                detailed_summary=result["detailed_summary"],
            ))
            s.commit()
        return result

    title = picked["title"]

    #2) recommendation
    try:
        short_rec = llm_short_recommendation(q, title, picked["content"])
    except Exception as e:
        print(" LLM recommendation failed:", e)
        short_rec = f"{title} might fit your request."

    #3) detailed local summary
    detailed = get_summary_by_title(title) or ""

    result = {
        "title": title,
        "short_recommendation": short_rec,
        "detailed_summary": detailed,
    }

    # save in hystoric
    with get_session() as s:
        s.add(History(
            query=q,
            title=result["title"],
            short_recommendation=result["short_recommendation"],
            detailed_summary=result["detailed_summary"],
        ))
        s.commit()

    return result


# ---- Image generation (gpt-image-1) ----
@app.post("/generate_image")
def generate_image(req: ImageRequest):
    """
    Generează o copertă (data URL PNG) pentru titlul recomandat.
    """
    title = (req.title or "").strip()
    theme = (req.theme or "").strip()

    if not title or title.lower() == "no match found":
        raise HTTPException(status_code=400, detail="Invalid or missing 'title'.")

    prompt = (
        f"A stylish, minimalist book cover for '{title}'. "
        f"Theme: {theme or 'literary, elegant'}. "
        "Flat illustration, high-contrast, balanced typography, no text overlays."
    )

    try:
        resp = client.images.generate(
            model=IMAGE_MODEL,
            prompt=prompt,
            size="1024x1024",  
        )

        if not resp or not getattr(resp, "data", None):
            return {"error": "No image data returned by the model."}
        first = resp.data[0]
        b64 = getattr(first, "b64_json", None)
        if not b64:
            return {"error": "No image bytes (b64_json) returned."}

        data_url = f"data:image/png;base64,{b64}"
        return {"image_url": data_url}

    except Exception as e:
        print(" Image generation failed:", e)
        return {"error": f"{e}"}


# ---- History: list / clear / delete one ----
@app.get("/history")
def list_history() -> List[dict]:
    with get_session() as s:
        rows = s.exec(select(History).order_by(History.created_at.desc())).all()
        return [
            {
                "id": r.id,
                "query": r.query,
                "title": r.title,
                "short_recommendation": r.short_recommendation,
                "detailed_summary": r.detailed_summary,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]

@app.delete("/history")
def clear_history():
    with get_session() as s:
        s.exec("DELETE FROM history")
        s.commit()
    return {"status": "cleared"}

@app.delete("/history/{item_id}")
def delete_history_item(item_id: int):
    with get_session() as s:
        row = s.get(History, item_id)
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")
        s.delete(row)
        s.commit()
    return {"status": "deleted", "id": item_id}
