import { createTheme } from '@mui/material';

export const theme = createTheme({
  // 页面整体背景用淡灰色，白色的卡片更有层次
  palette: { background: { default: '#eceef1' } },
  typography: { fontSize: 13 },
  components: {
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiButton: { defaultProps: { size: 'small', disableElevation: true } },
    MuiCheckbox: { defaultProps: { size: 'small' } },
    MuiRadio: { defaultProps: { size: 'small' } },
    MuiTab: { styleOverrides: { root: { minHeight: 40, textTransform: 'none' } } },
    MuiTabs: { styleOverrides: { root: { minHeight: 40 } } },
    MuiFormControlLabel: { styleOverrides: { label: { fontSize: 13 } } },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-disabled': { backgroundColor: theme.palette.action.hover },
        }),
      },
    },
    // Tooltip：白底卡片风格（细边框 + 柔和阴影 + 圆角），箭头同样带边框
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 150 },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)',
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: '0.02em',
          maxWidth: 320,
        }),
        arrow: ({ theme }) => ({
          color: theme.palette.background.paper,
          '&::before': { border: `1px solid ${theme.palette.divider}` },
        }),
      },
    },
  },
});
