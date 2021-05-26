import { PaletteType } from '@material-ui/core';

export default {
  palette: {
    primary: {
      main: "#1976d2"
    },
    type: 'dark' as PaletteType,
  }, overrides: {
    MuiTooltip: {
      tooltipPlacementBottom: {
        margin: "5px 0 !important",
      },
    },
    MuiInput: {
      root: {
        "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
          display: "none",
          margin: 80
        },
        '&[type=number]': {
          '-moz-appearance': 'textfield',
        },
        "&$disabled": {
          '&:before': {
            borderBottom: 'none!important',
          },
          '& svg': {
            display: 'none',
          },
        },
      },
      underline: {
        '&:after': {
          transition: 'none',
        },
      },
    },
    MuiInputBase: {
      input: {
        '&[type=number]': {
          '-moz-appearance': 'textfield',
        }
      },
    },
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