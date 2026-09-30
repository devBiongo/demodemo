import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

type Props = {
  label: ReactNode;
  children: ReactNode;
  labelWidth?: number;
  alignTop?: boolean;
};

export function FormRow({ label, children, labelWidth = 120, alignTop }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${labelWidth}px minmax(0, 1fr)`,
        columnGap: 2,
        alignItems: alignTop ? 'start' : 'center',
        minHeight: 40,
      }}
    >
      <Typography variant="body2" sx={{ textAlign: 'right', pt: alignTop ? 1 : 0 }}>
        {label}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );
}
