import json

# Load summaries from JSON
with open("book_summaries.json", "r", encoding="utf-8") as f:
    book_summaries = json.load(f)

def get_summary_by_title(title: str) -> str:
    """Returns the detailed summary for an exact title match."""
    for book in book_summaries:
        if book["title"].lower() == title.lower():
            return book["full_summary"]
    return "Summary for this title does not exist."
