# Book Recommendation System

An AI-powered web app that recommends books based on your interests, using **RAG** (ChromaDB + OpenAI embeddings).  
It generates a **short recommendation** with a small GPT model, provides a **detailed summary** from a local tool,  
can **generate a cover image**, reads text aloud (**TTS**), accepts voice input (**STT**), and stores all searches in a **history database**.

---

## Features

-  **Semantic Search (RAG)** – retrieves the most relevant book using ChromaDB + OpenAI embeddings  
-  **Small LLM Recommendation** – generates a short conversational suggestion (gpt-4o-mini)  
- **Detailed Summaries** – loaded locally via a tool (no token cost)  
-  **Image Generation** – book cover with `gpt-image-1`  
-  **Speech-to-Text** (voice input) & **Text-to-Speech** (listen to summaries)  
- **History Tracking** – every query is saved in SQLite (load/delete/clear from UI)  
-  **Profanity Guard** – blocks inappropriate queries before reaching the backend  

---

##  Project Structure

smart-librarian/

├─ backend.py # FastAPI app (RAG, LLM, image, history endpoints)

├─ main.py # builds Chroma vector store from JSON

├─ tools.py # get_summary_by_title() local summaries

├─ book_summaries.json # 10+ books: title, short_summary, full_summary

├─ models.py # SQLModel History schema

├─ db.py # DB init + session helpers

├─ chroma_db/ # persisted Chroma index (created by main.py)

└─ smart-librarian-ui/

├─ src/

│ ├─ api.js # API calls to backend

│ ├─ hooks/ # useTTS.js, useSTT.js

│ ├─ utils/ # profanity.js

│ ├─ components/ # TopBar, SearchBar, ResultCard, HistoryList

│ ├─ App.js # orchestrates frontend

│ └─ index.js # ThemeProvider + ColorModeContext

└─ package.json


---

##  Prerequisites

- Python **3.10+**  
- Node.js **18+**  
- OpenAI API key with access to **small models** (put in `.env`):

OPENAI_API_KEY=sk-xxxxxx

---

##  Setup & Installation

### 1. Backend


cd smart-librarian

python -m venv venv

venv\Scripts\activate   # (Windows)

pip install -r requirements.txt

Build the Chroma vector store (one-time):

python main.py

Run the backend:

uvicorn backend:app --reload

API base: http://127.0.0.1:8000

Swagger docs: http://127.0.0.1:8000/docs

### 2. Frontend

cd smart-librarian-ui
npm install
npm start
UI: http://127.0.0.1:3000

  API Endpoints
GET /health
Check backend status.
Response: {"status":"ok"}

POST /recommend
Body:

{ "query": "friendship and magic" }

Response:


{
  "title": "The Hobbit",
  "short_recommendation": "The Hobbit is a cozy fantasy adventure...",
  "detailed_summary": "Bilbo Baggins joins a band of dwarves..."
}
POST /generate_image
Body:

{ "title": "The Hobbit", "theme": "fantasy adventure" }
Response:

{ "image_url": "data:image/png;base64,..." }
GET /history
List all past queries.

DELETE /history
Clear all history.

DELETE /history/{id}
Delete a specific history entry.

### CLI Version (Optional)

Besides the web app (FastAPI + React), the project also includes a command-line interface (CLI) for quick testing.

File: chatbot.py 

Run it in your virtual environment:

venv\Scripts\activate   # Windows
python chatbot.py

Usage:

Type your query (e.g., friendship and magic)

The script will:

Retrieve the most relevant book from ChromaDB

Ask GPT-4o-mini to generate a short recommendation (3–4 sentences)

Load the detailed summary from the local tool (get_summary_by_title)

Output is printed in the terminal.

## Application Flow

1.User enters a query → /recommend

2.Backend runs RAG search → top matching book

3.GPT mini model generates a short recommendation

4.Local tool adds a detailed summary

5.Result is saved to SQLite history

UI shows results:

  -Recommendation + summary

  -Buttons for Listen/Stop (TTS)

  -Optional Cover Tools → /generate_image
    
  -User can load/delete/clear history from UI

## Speech & Audio

  TTS: Browser speechSynthesis (Web Speech API).

  STT: Chrome/Edge SpeechRecognition. If unsupported, mic button is hidden.

## Input Guard

  If the query contains banned words (fuck, shit, bitch, idiot, stupid),the UI shows a friendly warning and does not call the backend.

## Requirements (Python)

requirements.txt:

shell

fastapi

uvicorn[standard]

python-dotenv

openai>=1.30.0

sqlmodel

langchain-community

langchain-openai

chromadb
