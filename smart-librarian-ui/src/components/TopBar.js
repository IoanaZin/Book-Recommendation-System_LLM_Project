import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Tooltip, IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "../index";

export default function TopBar() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background:
          theme.palette.mode === "dark" ? "rgba(10,10,10,0.75)" : "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(99,102,241,0.18)",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          📚 Smart Librarian
        </Typography>
        <Tooltip title={theme.palette.mode === "dark" ? "Switch to light" : "Switch to dark"}>
          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
