import { PaletteType } from '@material-ui/core';

export default {
  palette: {
    type: 'dark' as PaletteType,
  }, overrides: {
    MuiFormControl: {
      root: {
        margin: '0 0!important',
      },
    },
    MuiTablePagination: {
      spacer: {
        flex: 'none',
      },
      selectRoot: {
        margin: '0 1vh!important',
      },
      actions: {
        margin: '0 0!important',
      }
    },
    MuiTableCell: {
      root: {
        padding: '12px 12px',
      }
    },
  },
  typography: {
    subtitle1: {
      fontSize: "1.2rem",
      lineHeight: "1"
    },
    h3: {
      '@media (min-width:0)': {
        fontSize: '2.2rem',
      },
      '@media (min-width:600px)': {
        fontSize: '3rem',
      }
    },
    h6: {
      '@media (min-width:0)': {
        fontSize: '1.2rem',
      },
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    }
  },
};