import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=api_key
)

chroma_db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embedding_model
)

# Ia toate documentele (atenție: doar pt debug)
docs = chroma_db.get()
print("📚 Titluri în vector store:")
for i, meta in enumerate(docs["metadatas"]):
    print(f"{i+1}. {meta.get('title')}")
