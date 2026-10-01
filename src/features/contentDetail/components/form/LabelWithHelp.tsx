import type { ReactNode } from 'react';
import { Box, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

type Props = {
  label: ReactNode;
  help?: ReactNode;
};

export function LabelWithHelp({ label, help }: Props) {
  if (!help) return <>{label}</>;
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      {label}
      <Tooltip title={help} arrow>
        {/* 防止点击帮助图标时触发 label 关联的 checkbox / radio */}
        <HelpOutlineIcon
          sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }}
          onClick={(e) => e.preventDefault()}
        />
      </Tooltip>
    </Box>
  );
}
