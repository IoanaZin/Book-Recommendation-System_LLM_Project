import React from "react";
import { Stack, TextField, Button, CircularProgress, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";

const suggestions = [
  "friendship and magic",
  "dystopia, social control",
  "adventure and coming of age",
  "war, honor, sacrifice",
];

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  loading,
  sttSupported,
  listening,
  onStartListening,
}) {
  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mt={2}>
        <TextField
          fullWidth
          label="What do you want to read?"
          placeholder="e.g. friendship and magic, dystopia, war..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={onSearch}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : <SearchIcon />}
          sx={{ px: 3, py: 1.2, fontWeight: 700 }}
        >
          {loading ? "Searching..." : "Search"}
        </Button>

        {sttSupported && (
          <Button
            variant={listening ? "contained" : "outlined"}
            color={listening ? "error" : "primary"}
            onClick={onStartListening}
            disabled={listening}
            startIcon={<MicIcon />}
            sx={{ px: 2.2, py: 1.2, fontWeight: 700, position: "relative" }}
          >
            {listening ? "Listening..." : "Speak"}
            {listening && (
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "red",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              />
            )}
          </Button>
        )}
      </Stack>

      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
        {suggestions.map((s) => (
          <Chip
            key={s}
            label={s}
            onClick={() => setQuery(s)}
            sx={{
              mr: 1,
              mb: 1,
              borderRadius: 999,
              border: "1px solid rgba(99,102,241,0.25)",
              background: "linear-gradient(90deg, rgba(99,102,241,0.1), rgba(244,63,94,0.08))",
            }}
          />
        ))}
      </Stack>
    </>
  );
}
