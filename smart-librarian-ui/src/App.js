import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Divider, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import TopBar from "./components/TopBar";
import SearchBar from "./components/SearchBar";
import ResultCard from "./components/ResultCard";
import HistoryList from "./components/HistoryList.js";

import { fetchRecommend, fetchGenerateImage, fetchHistory, clearHistory, deleteHistoryItem } from "./api";
import { containsProfanity } from "./utils/profanity";
import useTTS from "./hooks/useTTS";
import useSTT from "./hooks/useSTT";

export default function App() {
  const theme = useTheme();

  // state curent
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  // history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // TTS / STT
  const { supported: ttsSupported, speaking, speak, stop } = useTTS();
  const { supported: sttSupported, listening, start } = useSTT();

  const gradientBg = "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(244,63,94,0.12))";
  const glass = {
    backdropFilter: "blur(10px)",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(180deg, rgba(17,17,17,0.72), rgba(17,17,17,0.5))"
        : "linear-gradient(180deg, rgba(255,255,255,0.66), rgba(255,255,255,0.48))",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(99,102,241,0.24)"
        : "1px solid rgba(99,102,241,0.18)",
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await fetchHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // actions
  const handleSearch = async () => {
    if (!query.trim()) return;
    if (containsProfanity(query)) {
      setError("⚠️ Please rephrase politely ");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setImageUrl(null);
    stop();

    try {
      const data = await fetchRecommend(query);
      setResult(data);
      await loadHistory();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!result?.title) return;
    setImgLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const data = await fetchGenerateImage(result.title, query);
      if (data.image_url) setImageUrl(data.image_url);
      else if (data.image_b64) setImageUrl(`data:image/png;base64,${data.image_b64}`);
      else if (data.error) setError(`Image generation failed: ${data.error}`);
      else setError("No image returned.");
    } catch (e) {
      setError(`Image generation failed: ${String(e)}`);
    } finally {
      setImgLoading(false);
    }
  };

  const handleStartListening = () => start((txt) => setQuery(txt));

  return (
    <>
      <TopBar />

      <Box sx={{ minHeight: "100vh", py: 6, background: gradientBg }}>
        <Container maxWidth="md">
          <Box sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", ...glass }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Find your next great book.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Describe a vibe, a theme, or a mood — I’ll suggest a title, summarize it, and even sketch a cover.
            </Typography>

            <SearchBar
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
              loading={loading}
              sttSupported={sttSupported}
              listening={listening}
              onStartListening={handleStartListening}
            />

            <Divider sx={{ my: 3 }} />

            {error && <Alert severity="error">{error}</Alert>}

            <ResultCard
              result={result}
              imageUrl={imageUrl}
              imgLoading={imgLoading}
              onGenerateImage={handleGenerateImage}
              ttsSupported={ttsSupported}
              speaking={speaking}
              speak={speak}
              stop={stop}
            />
          </Box>

          <HistoryList
            items={history}
            loading={historyLoading}
            onClearAll={async () => {
              await clearHistory();
              loadHistory();
            }}
            onDelete={async (id) => {
              await deleteHistoryItem(id);
              loadHistory();
            }}
            onLoadItem={(item) => {
              setQuery(item.query);
              setResult({
                title: item.title,
                short_recommendation: item.short_recommendation,
                detailed_summary: item.detailed_summary,
              });
              setImageUrl(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            shellStyle={glass}
          />

          <Box sx={{ mt: 3, px: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              Models: small (4o-mini / 4.1-mini / 4.1-nano)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} Smart Librarian
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}
