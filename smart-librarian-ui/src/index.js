import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Context pentru a putea apela toggle din App
export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function getInitialMode() {
  const saved = localStorage.getItem("color-mode");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function Root() {
  const [mode, setMode] = React.useState(getInitialMode());

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("color-mode", next);
          return next;
        });
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#6366f1" },   // indigo
          secondary: { main: "#f43f5e" }, // rose
        },
        shape: { borderRadius: 14 },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
