import React, { useEffect } from "react";
import { makeStyles, createStyles, useTheme, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { str_time, intToMods } from '../lib/Util'
import TablePagination from '@material-ui/core/TablePagination';
import { getMaps } from '../lib/DB'
import { Hidden, IconButton, Link, Typography } from "@material-ui/core";
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { formatDistance } from 'date-fns'
import Box from '@material-ui/core/Box';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import GamepadIcon from '@material-ui/icons/Gamepad';
import StarIcon from '@material-ui/icons/Star';
import Grid from '@material-ui/core/Grid';
import { SkeletonTable } from './SkeletonTable'


const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  table: {
    minWidth: 0,
  },
  typography: {
    fontSize: '0.7rem',
  }
});

const useStyles1 = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    }
  }),
);

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onChangePage: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}
export default function DataTable(props: { mapData: any; setMapData: any, resultCount: any; setCount: any; filters: any; setFilters: any; page: any; setPage: any; rowsPerPage: any; setRowsPerPage: any; endPage: any; loading: any; setLoading: any }) {

  const classes = useStyles();

  const [initialLoad, setInitialLoad] = React.useState(false);

  const scrollToBottom = () => {
    props.endPage.current?.scrollIntoView()
  }

  const handleChangePage = async (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    props.setLoading(true)
    props.setPage(newPage);
    const response = await getMaps(newPage, props.rowsPerPage, props.filters, undefined, true);
    const bigArr = response.result[0]["values"].map((row: any, index: number) => {
      const arrDict: { [key: string]: any } = {}
      { arrDict['pos'] = newPage * props.rowsPerPage + index + 1 }
      response.result[0]["columns"].forEach((value: any, index: number) => { arrDict[value] = row[index] })
      return arrDict
    })
    props.setMapData(bigArr)
    props.setLoading(false)
    scrollToBottom()
  };

  const handleChangeRowsPerPage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setLoading(true)
    let newPage = Math.floor((props.page * props.rowsPerPage) / parseInt(event.target.value, 10))
    props.setPage(newPage)
    props.setRowsPerPage(parseInt(event.target.value, 10));
    const response = await getMaps(newPage, parseInt(event.target.value, 10), props.filters, undefined, true);
    const bigArr = response.result[0]["values"].map((row: any, index: number) => {
      const arrDict: { [key: string]: any } = {}
      { arrDict['pos'] = newPage * parseInt(event.target.value, 10) + index + 1 }
      response.result[0]["columns"].forEach((value: any, index: number) => { arrDict[value] = row[index] })
      return arrDict
    })
    props.setMapData(bigArr)
    props.setLoading(false)
    scrollToBottom()
  };

  async function componentDidMount() {
    setInitialLoad(true)
    props.setLoading(true)
    const response = await getMaps(props.page, props.rowsPerPage, props.filters, true);

    if (response.count[0].values[0][0] == 0) {
      props.setCount(0)
      return
    }
    props.setCount(response.count[0].values[0][0])
    const bigArr = response.result[0]["values"].map((row: any, index: number) => {
      const arrDict: { [key: string]: any } = {}
      { arrDict['pos'] = props.page * props.rowsPerPage + index + 1 }
      response.result[0]["columns"].forEach((value: any, index: number) => { arrDict[value] = row[index] })
      return arrDict
    })

    props.setMapData(bigArr)
    props.setLoading(false)

  };


  useEffect(() => {
    if (!initialLoad) {
      componentDidMount()
    }
  });

  return (
    <div className={classes.root}>
      {/* {String(this.data)} */}
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="custom pagination table">
          <Hidden mdUp>
            <TableHead></TableHead>
          </Hidden>
          <Hidden smDown>
            <TableHead>
              <TableRow>
                <TableCell align="left">#</TableCell>
                <TableCell></TableCell>
                <TableCell>Map</TableCell>
                <TableCell align="center">Farm Score</TableCell>
                <TableCell align="center">PP</TableCell>
                <TableCell align="center">Acc</TableCell>
                <TableCell align="center">Mods</TableCell>
                <TableCell align="center">Length</TableCell>
                <TableCell align="center">BPM</TableCell>
                <TableCell align="center">Stars</TableCell>
              </TableRow>
            </TableHead>
          </Hidden>
          {props.loading ? <SkeletonTable rowsPerPage={props.rowsPerPage} /> : (
            <TableBody>
              {/* Mobile View */}
              <Hidden mdUp>
                {props.mapData.map((row: any) => (
                  <TableRow key={row.bid.toString() + row.pop_mod.toString() + row.mode.toString()}>
                    <TableCell align="left">
                      <Grid container>
                        <Grid item style={{ marginRight: 'auto' }}>
                          <img src={"https://b.ppy.sh/thumb/" + row.sid + '.jpg'}></img>
                        </Grid>
                        <Grid item xs><Box ml={1}><Typography variant="subtitle1" display={"inline"}><Link color="inherit" href={"https://osu.ppy.sh/b/" + row.bid}>{row.artist} - {row.name} [{row.version}]</Link></Typography>
                          <br></br>
                          <Typography color="textSecondary" className={classes.typography} >{(row.mode != 3 && row.mode != 1) ? "AR: " + row.ar.toFixed(1) : ""} {(row.mode != 1) ? ((row.mode == 3) ? "Keys: " + row.cs.toFixed(0) : "CS: " + row.cs.toFixed(1)) : ""} OD: {row.od.toFixed(1)}</Typography >
                          <Typography color="textSecondary" className={classes.typography}>Ranked: {formatDistance(new Date(row.date_ranked * 1000), new Date())} ago</Typography >
                        </Box>
                        </Grid>
                      </Grid>
                      <Grid container justify="space-around">
                        <Box>
                          <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" ><GamepadIcon /></Box>
                            <Box display="flex" justifyContent="center" fontWeight="fontWeightBold">{row.score.toFixed(2)}</Box>
                          </Grid>
                        </Box>
                        <Box>
                          <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">PP</Box>
                            <Box display="flex" justifyContent="center">{row.avg_pp.toFixed(0)}</Box>
                          </Grid>
                        </Box>
                        <Box>
                          <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">Acc</Box>
                            <Box display="flex" justifyContent="center">{(row.avg_acc * 100).toFixed(2)}%</Box>
                          </Grid>
                        </Box>
                        <Box>
                          <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">Mods</Box>
                            <Box display="flex" justifyContent="center">{intToMods(row.pop_mod)}</Box>
                          </Grid>
                        </Box>
                        <Box>
                          <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center"><WatchLaterIcon /></Box>
                            <Box display="flex" justifyContent="center">{str_time(row.length)}</Box>
                          </Grid>
                        </Box>
                        <Box>
                          <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">BPM</Box>
                            <Box display="flex" justifyContent="center">{row.bpm.toFixed(2)}</Box>
                          </Grid>
                        </Box>
                        <Box>
                          <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center"><StarIcon /></Box>
                            <Box display="flex" justifyContent="center">{row.diff.toFixed(2)}</Box>
                          </Grid>
                        </Box>
                      </Grid>
                    </TableCell>
                  </TableRow>
                ))}
              </Hidden>
              {/* Desktop View */}
              <Hidden smDown>
                {props.mapData.map((row: any) => (
                  <TableRow key={row.bid.toString() + row.pop_mod.toString() + row.mode.toString()}>
                    <TableCell align="left">{row.pos}</TableCell>
                    <TableCell><img src={"https://b.ppy.sh/thumb/" + row.sid + '.jpg'}></img></TableCell>
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle1"><Link color="inherit" href={"https://osu.ppy.sh/b/" + row.bid}>{row.artist} - {row.name} [{row.version}]</Link></Typography>
                      <Typography color="textSecondary" className={classes.typography}>{(row.mode != 3 && row.mode != 1) ? "AR: " + row.ar.toFixed(1) : ""} {(row.mode != 1) ? ((row.mode == 3) ? "Keys: " + row.cs.toFixed(0) : "CS: " + row.cs.toFixed(1)) : ""} OD: {row.od.toFixed(1)}</Typography >
                      <Typography color="textSecondary" className={classes.typography}>Ranked: {formatDistance(new Date(row.date_ranked * 1000), new Date())} ago</Typography >
                    </TableCell>
                    <TableCell align="center"><Box fontSize={"1.5rem"} fontWeight="fontWeightBold">{row.score.toFixed(2)}</Box></TableCell>
                    <TableCell align="center">{row.avg_pp.toFixed(2)}</TableCell>
                    <TableCell align="center">{(row.avg_acc * 100).toFixed(2)}%</TableCell>
                    <TableCell align="center">{intToMods(row.pop_mod)}</TableCell>
                    <TableCell align="center">{str_time(row.length)}</TableCell>
                    <TableCell align="center">{row.bpm.toFixed(2)}</TableCell>
                    <TableCell align="center">{row.diff.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </Hidden>

            </TableBody>)
          }
        </Table>
      </TableContainer>
      <Hidden mdUp>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100, 250]}
          count={props.resultCount}
          rowsPerPage={props.rowsPerPage}
          component='div'
          labelRowsPerPage='Per Page'
          page={props.page}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true,
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Hidden>
      <Hidden smDown>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100, 250]}
          count={props.resultCount}
          rowsPerPage={props.rowsPerPage}
          labelRowsPerPage='Maps per page'
          component='div'
          page={props.page}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' },
            native: true,
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </Hidden>
    </div>
  );
}