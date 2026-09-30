import { createTheme } from '@mui/material';

export const theme = createTheme({
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
  },
});
