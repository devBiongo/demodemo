import { Box, CircularProgress } from '@mui/material';

export function EditorFallback({ height }: { height?: number | string }) {
  return (
    <Box sx={{ height, display: 'grid', placeItems: 'center' }}>
      <CircularProgress size={24} />
    </Box>
  );
}
