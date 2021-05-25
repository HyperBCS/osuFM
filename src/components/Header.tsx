import { Box, Link } from '@material-ui/core';
import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ThemeSwitcher from './ThemeSwitch'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    search: {
      margin: theme.spacing(1),
      position: 'relative',
    }
  }),
);

export default function Header(props: { theme: any; setTheme: any }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box display="flex"
        justifyContent="space-between">
        <Link color="inherit" href="/">
          <Typography variant="h3" style={{ display: 'inline-block' }}>osu!F</Typography><Typography variant="h6" style={{ display: 'inline-block' }}>armers</Typography><Typography variant="h3" style={{ display: 'inline-block' }}>M</Typography><Typography variant="h6" style={{ display: 'inline-block' }}>arket</Typography>
        </Link>
        <ThemeSwitcher theme={props.theme} setTheme={props.setTheme} />
      </Box>
    </div>
  );
}