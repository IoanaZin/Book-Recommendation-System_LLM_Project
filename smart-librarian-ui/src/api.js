export const API_BASE = "http://127.0.0.1:8000";

export async function fetchRecommend(query) {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Server error");
  return res.json();
}

export async function fetchGenerateImage(title, theme) {
  const res = await fetch(`${API_BASE}/generate_image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, theme }),
  });
  if (!res.ok) throw new Error("Server error");
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error("History error");
  return res.json();
}

export async function clearHistory() {
  const res = await fetch(`${API_BASE}/history`, { method: "DELETE" });
  if (!res.ok) throw new Error("Clear history error");
  return res.json();
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete item error");
  return res.json();
}
