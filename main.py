import json
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document

# load .env
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("❌ OPENAI_API_KEY lipsă. Verifică fișierul .env")

# Load summaries from JSON
with open("book_summaries.json", "r", encoding="utf-8") as f:
    book_summaries = json.load(f)

# Create documents
documents = [
    Document(page_content=entry["short_summary"], metadata={"title": entry["title"]})
    for entry in book_summaries
]

# Create embeddings and vector store
embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=api_key
)

chroma_db = Chroma.from_documents(
    documents=documents,
    embedding=embedding_model,
    persist_directory="chroma_db"
)

chroma_db.persist()
print("✅ Vector store successfully created and saved in the 'chroma_db' folder")