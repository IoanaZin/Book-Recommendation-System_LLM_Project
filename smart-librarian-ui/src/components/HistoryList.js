import React from "react";
import { Box, Stack, Typography, Button, Card, CardContent } from "@mui/material";

export default function HistoryList({
  items,
  loading,
  onClearAll,
  onDelete,
  onLoadItem,
  shellStyle,
}) {
  return (
    <Box sx={{ mt: 4, p: { xs: 3, sm: 4 }, borderRadius: 4, ...shellStyle }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>🕑 Search history</Typography>
        {items.length > 0 && (
          <Button size="small" color="error" variant="text" onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </Stack>

      {loading ? (
        <Box sx={{ p: 2, borderRadius: 2, border: "1px dashed #e2e8f0", color: "text.secondary" }}>
          Loading history...
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ p: 2, borderRadius: 2, border: "1px dashed #e2e8f0", color: "text.secondary" }}>
          No history yet.
        </Box>
      ) : (
        <Stack spacing={2}>
          {items.map((item) => (
            <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Query: {item.query}
                    </Typography>
                    {item.short_recommendation && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {item.short_recommendation}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => onLoadItem(item)}>
                      Load
                    </Button>
                    <Button size="small" color="error" variant="text" onClick={() => onDelete(item.id)}>
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
