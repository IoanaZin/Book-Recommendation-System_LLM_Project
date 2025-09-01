import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from tools import get_summary_by_title

# Load .env
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("❌ OPENAI_API_KEY is missing. Check your .env file!")

# Load embeddings + vector store
embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=api_key
)

chroma_db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embedding_model
)
retriever = chroma_db.as_retriever(search_kwargs={"k": 1})

# Small LLM (as required)
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2,
    max_tokens=512,
    api_key=api_key
)

print("📚 Smart Librarian (non-agentic)")
print("Type 'exit' to quit.\n")

while True:
    query = input("You: ")
    if query.lower() in ["exit", "quit"]:
        print("Goodbye! 👋")
        break

    # 1. Retrieve most relevant document
    results = retriever.get_relevant_documents(query)
    if not results:
        print("Bot: I couldn't find a suitable book.\n")
        continue

    title = results[0].metadata.get("title", "Unknown title")

    # 2. Short recommendation with LLM
    prompt = (
        f"User question: {query}\n"
        f"Suggested book: {title}\n"
        f"Write a short recommendation in English (3–4 sentences)."
    )
    resp = llm.invoke(prompt)

    # 3. Detailed summary from tool
    summary = get_summary_by_title(title)

    print("\nBot (short recommendation):", resp.content)
    print("\n📖 Detailed summary:", summary, "\n")
