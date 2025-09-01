// src/components/ResultCard.js
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Skeleton,
  Stack,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopIcon from "@mui/icons-material/Stop";

export default function ResultCard({
  result,
  imageUrl,
  imgLoading,
  onGenerateImage,
  ttsSupported,
  speaking,
  speak,
  stop,
}) {
  // hook-urile întotdeauna la început
  const [showCoverTools, setShowCoverTools] = useState(false);

  if (!result) return null;

  const LeftColumn = () => (
    <Grid item xs={12} md={5} sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ImageIcon />}
          onClick={onGenerateImage}
          disabled={imgLoading}
          fullWidth
        >
          {imgLoading ? "Generating..." : "Generate image"}
        </Button>
        <Button variant="text" onClick={() => setShowCoverTools(false)}>
          Hide
        </Button>
      </Stack>

      {imgLoading && (
        <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
      )}

      {!imgLoading && imageUrl && (
        <Box
          component="img"
          src={imageUrl}
          alt={`Generated cover for ${result.title}`}
          sx={{
            width: "100%",
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.08)",
            display: "block",
            objectFit: "cover",
            maxHeight: 360,
          }}
        />
      )}

      {!imgLoading && !imageUrl && (
        <Box
          sx={{
            height: 260,
            bgcolor: "rgba(148,163,184,0.12)",
            border: "1px dashed rgba(148,163,184,0.6)",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            fontSize: 14,
          }}
        >
          No image yet — click “Generate image”.
        </Box>
      )}
    </Grid>
  );

  const RightColumn = () => (
    <Grid item xs={12} md={showCoverTools ? 7 : 12}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5" fontWeight={800} sx={{ flexGrow: 1 }}>
          {result.title}
        </Typography>

        {!showCoverTools && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => setShowCoverTools(true)}
          >
            Generate a Cover 
          </Button>
        )}
      </Stack>

      {result.short_recommendation && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Recommendation
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {result.short_recommendation}
          </Typography>
          {ttsSupported && (
            <Stack direction="row" spacing={1} mb={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VolumeUpIcon />}
                onClick={() => speak(result.short_recommendation)}
              >
                Listen
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<StopIcon />}
                onClick={stop}
                disabled={!speaking}
              >
                Stop
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {result.detailed_summary && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Detailed Summary
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {result.detailed_summary}
          </Typography>
          {ttsSupported && (
            <Stack direction="row" spacing={1} mb={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VolumeUpIcon />}
                onClick={() => speak(result.detailed_summary)}
              >
                Listen
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<StopIcon />}
                onClick={stop}
                disabled={!speaking}
              >
                Stop
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Grid>
  );

  return (
    <Card elevation={0} sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid rgba(99,102,241,0.18)" }}>
      <CardContent>
        <Grid container spacing={3}>
          {showCoverTools && <LeftColumn />}
          <RightColumn />
        </Grid>
      </CardContent>
    </Card>
  );
}
