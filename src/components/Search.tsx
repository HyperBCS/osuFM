import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { Collapse, FormGroup } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Hidden from '@material-ui/core/Hidden';
import FormControl from '@material-ui/core/FormControl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { getMaps } from '../lib/DB'
import DateFnsUtils from '@date-io/date-fns';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  DatePicker,
} from '@material-ui/pickers';
import { Sliders } from './Sliders'


import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
    root: {
      flexGrow: 1,
    },
    search: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    radio: {
      "& -webkit-user-select": "none",
      "& -moz-user-select": "none",
      "& -ms-user-select: none": "none",
      userSelect: "none",
    },
    input: {
      "& ::-webkit-input-placeholder": {
        color: "white"
      },
      color: "white",
      '& .MuiInput-underline:after': {
        borderBottomColor: '#fff', // Solid underline on focus
      },
      '& .MuiInput-underline:before': {
        borderBottomColor: 'rgba(255, 255, 255, 0.16)', // Solid underline on focus
      },
      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        borderBottomColor: 'rgba(255, 255, 255, 0.7)', // Solid underline on focus
      },
    },
  }),
);

interface Input {
  mapData: any;
  setMapData: any;
  resultCount: any;
  setCount: any;
  filters: any;
  setFilters: any;
  page: any;
  setPage: any;
  rowsPerPage: any;
  setRowsPerPage: any;
  loading: any;
  setLoading: any
}

export const SearchBar = React.memo(function SearchBar(props: Input) {

  const classes = useStyles();

  const [open, setOpen] = React.useState(true);

  const [localSearch, setSearch] = React.useState("");

  const [indetermineDT, setDTindet] = React.useState(false);
  const [checkedDT, setDTcheck] = React.useState(false);

  const [indetermineHT, setHTindet] = React.useState(false);
  const [checkedHT, setHTcheck] = React.useState(false);

  const [indetermineHD, setHDindet] = React.useState(false);
  const [checkedHD, setHDcheck] = React.useState(false);

  const [indetermineHR, setHRindet] = React.useState(false);
  const [checkedHR, setHRcheck] = React.useState(false);

  const [indetermineEZ, setEZindet] = React.useState(false);
  const [checkedEZ, setEZcheck] = React.useState(false);

  const [indetermineFL, setFLindet] = React.useState(false);
  const [checkedFL, setFLcheck] = React.useState(false);

  const [indetermineNO, setNOindet] = React.useState(false);
  const [checkedNO, setNOcheck] = React.useState(false);

  const [localMinPP, setMinPP] = React.useState("");
  const [localMaxPP, setMaxPP] = React.useState("");

  const [localMinDate, setMinDate] = React.useState(new Date('2007-09-16T00:00:01'));
  const [localMaxDate, setMaxDate] = React.useState(new Date());

  const [localMinLen, setMinLen] = React.useState(new Date('2007-09-16T00:00:00'));
  const [localMaxLen, setMaxLen] = React.useState(new Date('2007-09-16T23:59:59'));

  const [localMinBPM, setMinBPM] = React.useState("");
  const [localMaxBPM, setMaxBPM] = React.useState("");

  const [reset, setReset] = React.useState(false);

  const [filterToggle, setFilterToggle] = React.useState(true);

  const [modeDropdownIcon, setModeIcon] = React.useState(<ArrowDropDownIcon />);

  const [filterIcon, setFilterIcon] = React.useState(<ArrowDropDownIcon />);

  const [modeString, setModeString] = React.useState("Standard");
  const [modeVal, setModeVal] = React.useState(0);



  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    filter_tmp.search = event.target.value
    props.setFilters(filter_tmp)
    setSearch(event.target.value)
    updateMaps(0, props.rowsPerPage, filter_tmp)
    props.setFilters(filter_tmp)

  };

  const handleFilter = () => {
    if (filterToggle) {
      setFilterToggle(!filterToggle)
      setFilterIcon(<ArrowDropUpIcon />)
    } else {
      setFilterToggle(!filterToggle)
      setFilterIcon(<ArrowDropDownIcon />)
    }

    setOpen(!open);
  };

  const handleModChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value == "64") {
      if (!indetermineDT && !checkedDT) {
        setDTcheck(true)
        setDTindet(false)
      } else if (!indetermineDT && checkedDT) {
        setDTindet(true)
      } else if (indetermineDT && checkedDT) {
        setDTcheck(false)
        setDTindet(false)
      }
    }

    if (event.target.value == "256") {
      if (!indetermineHT && !checkedHT) {
        setHTcheck(true)
        setHTindet(false)
      } else if (!indetermineHT && checkedHT) {
        setHTindet(true)
      } else if (indetermineHT && checkedHT) {
        setHTcheck(false)
        setHTindet(false)
      }
    }

    if (event.target.value == "8") {
      if (!indetermineHD && !checkedHD) {
        setHDcheck(true)
        setHDindet(false)
      } else if (!indetermineHD && checkedHD) {
        setHDindet(true)
      } else if (indetermineHD && checkedHD) {
        setHDcheck(false)
        setHDindet(false)
      }
    }

    if (event.target.value == "16") {
      if (!indetermineHR && !checkedHR) {
        setHRcheck(true)
        setHRindet(false)
      } else if (!indetermineHR && checkedHR) {
        setHRindet(true)
      } else if (indetermineHR && checkedHR) {
        setHRcheck(false)
        setHRindet(false)
      }
    }

    if (event.target.value == "2") {
      if (!indetermineEZ && !checkedEZ) {
        setEZcheck(true)
        setEZindet(false)
      } else if (!indetermineEZ && checkedEZ) {
        setEZindet(true)
      } else if (indetermineEZ && checkedEZ) {
        setEZcheck(false)
        setEZindet(false)
      }
    }

    if (event.target.value == "1024") {
      if (!indetermineFL && !checkedFL) {
        setFLcheck(true)
        setFLindet(false)
      } else if (!indetermineFL && checkedFL) {
        setFLindet(true)
      } else if (indetermineFL && checkedFL) {
        setFLcheck(false)
        setFLindet(false)
      }
    }

    if (event.target.value == "-1") {
      if (!indetermineNO && !checkedNO) {
        setNOcheck(true)
        setNOindet(false)
      } else if (!indetermineNO && checkedNO) {
        setNOindet(true)
      } else if (indetermineNO && checkedNO) {
        setNOcheck(false)
        setNOindet(false)
      }
    }

  };

  const handleMinPP = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    filter_tmp.min_pp = event.target.value
    props.setFilters(filter_tmp)
    setMinPP(event.target.value)
  };

  const handleMaxPP = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    filter_tmp.max_pp = event.target.value
    props.setFilters(filter_tmp)
    setMaxPP(event.target.value)
  };

  const handleMinDate = (date: Date | null) => {
    if (date == null) return
    let tmp_date = date.valueOf() / 1000
    if (isNaN(tmp_date)) return
    setMinDate(date)
    let filter_tmp = props.filters
    filter_tmp.min_date = tmp_date
    props.setFilters(filter_tmp);
  };
  const handleMaxDate = (date: Date | null) => {
    if (date == null) return
    let tmp_date = date.valueOf() / 1000
    if (isNaN(tmp_date)) return
    setMaxDate(date)
    let filter_tmp = props.filters
    filter_tmp.max_date = tmp_date
    props.setFilters(filter_tmp);
  };
  const handleMinLen = (date: Date | null) => {
    if (date == null) return
    let tmp_date = date.getMinutes() * 60 + date.getSeconds();
    if (isNaN(tmp_date)) return
    setMinLen(date)
    let filter_tmp = props.filters
    filter_tmp.min_len = tmp_date
    props.setFilters(filter_tmp);
  };
  const handleMaxLen = (date: Date | null) => {
    if (date == null) return
    let tmp_date = date.getMinutes() * 60 + date.getSeconds();
    if (isNaN(tmp_date)) return
    setMaxLen(date)
    let filter_tmp = props.filters
    filter_tmp.max_len = tmp_date
    props.setFilters(filter_tmp);
  };

  const handleMinBPM = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    filter_tmp.min_bpm = event.target.value
    props.setFilters(filter_tmp)
    setMinBPM(event.target.value)
  };

  const handleMaxBPM = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    filter_tmp.max_bpm = event.target.value
    props.setFilters(filter_tmp)
    setMaxBPM(event.target.value)
  };


  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    setModeIcon(<ArrowDropUpIcon />)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async (event: React.MouseEvent<HTMLLIElement>) => {
    setModeIcon(<ArrowDropDownIcon />)
    setAnchorEl(null);
    if (event.currentTarget.innerText.length != 0) {
      setModeString(event.currentTarget.innerText)
      setModeVal(event.currentTarget.value)
      let filter_tmp = props.filters
      filter_tmp.mode = event.currentTarget.value
      props.setFilters(filter_tmp)
      updateMaps(0, props.rowsPerPage, filter_tmp)
      props.setFilters(filter_tmp)
    }

  };

  const updateMaps = async (page: number, rowsPerPage: number, filters: any) => {
    props.setLoading(true)
    const response = await getMaps(page, rowsPerPage, filters);
    if (response.count[0].values[0][0] == 0) {
      props.setMapData([])
      props.setCount(0)
      props.setLoading(false)
      return false
    }
    const bigArr = response.result[0]["values"].map((row: any, index: number) => {
      const arrDict: { [key: string]: any } = {}
      { arrDict['pos'] = index + 1 }
      response.result[0]["columns"].forEach((value: any, index: number) => { arrDict[value] = row[index] })
      return arrDict
    })
    props.setPage(page)
    props.setMapData(bigArr)
    props.setLoading(false)
    props.setCount(response.count[0].values[0][0])
    return true
  }

  const handleFilterReset = async () => {
    setReset(true)
    let filter_tmp = {
      search: "",
      mode: modeVal,
      mods_enabled: false,
      req_mods: 0,
      opt_mods: 0,
      min_pp: 0,
      max_pp: Number.MAX_SAFE_INTEGER,
      min_date: 0,
      max_date: Number.MAX_SAFE_INTEGER,
      min_len: 0,
      max_len: Number.MAX_SAFE_INTEGER,
      min_bpm: 0,
      max_bpm: Number.MAX_SAFE_INTEGER,
      min_diff: 0,
      max_diff: 15,
      min_ar: 0,
      max_ar: 11,
      min_cs: 0,
      max_cs: 10
    }
    setDTcheck(false)
    setDTindet(false)
    setHTcheck(false)
    setHTindet(false)
    setHDcheck(false)
    setHDindet(false)
    setHRcheck(false)
    setHRindet(false)
    setEZcheck(false)
    setEZindet(false)
    setFLcheck(false)
    setFLindet(false)
    setNOcheck(false)
    setNOindet(false)
    setMinPP("")
    setMaxPP("")
    setMinBPM("")
    setMaxBPM("")
    setSearch("")
    setMinDate(new Date('2007-09-16T00:00:01'));
    setMaxDate(new Date());
    setMinLen(new Date('2007-09-16T00:00:00'))
    setMaxLen(new Date('2007-09-16T23:59:59'))
    updateMaps(0, props.rowsPerPage, filter_tmp)
    props.setPage(0)
    props.setFilters(filter_tmp)

  }


  const handleFilterApply = async () => {
    let filter_tmp = props.filters
    filter_tmp.req_mods = 0
    filter_tmp.opt_mods = 0
    if (checkedDT && !indetermineDT) (filter_tmp.req_mods += 64)
    if (checkedHT && !indetermineHT) (filter_tmp.req_mods += 256)
    if (checkedHD && !indetermineHD) (filter_tmp.req_mods += 8)
    if (checkedHR && !indetermineHR) (filter_tmp.req_mods += 16)
    if (checkedEZ && !indetermineEZ) (filter_tmp.req_mods += 2)
    if (checkedFL && !indetermineFL) (filter_tmp.req_mods += 1024)
    if (checkedNO && !indetermineNO) (filter_tmp.req_mods += -1)

    if (indetermineDT) (filter_tmp.opt_mods += 64)
    if (indetermineHT) (filter_tmp.opt_mods += 256)
    if (indetermineHD) (filter_tmp.opt_mods += 8)
    if (indetermineHR) (filter_tmp.opt_mods += 16)
    if (indetermineEZ) (filter_tmp.opt_mods += 2)
    if (indetermineFL) (filter_tmp.opt_mods += 1024)

    if (filter_tmp.req_mods != 0 || filter_tmp.req_mods != 0) {
      filter_tmp.mods_enabled = true
    } else {
      filter_tmp.mods_enabled = false
    }
    updateMaps(0, props.rowsPerPage, filter_tmp)
    props.setFilters(filter_tmp)
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{ background: '#3f51b5' }}>
        <Toolbar>
          <Grid container justify="center">
            <Box>
              <FormControl>
                <Button aria-controls="simple-menu" variant="contained" color="secondary" className={classes.button} startIcon={modeDropdownIcon} id="modeSelect" aria-haspopup="true" onClick={handleMode}>
                  {modeString}
                </Button>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  getContentAnchorEl={null}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                  }}
                >
                  <MenuItem onClick={handleClose} value={0}>Standard</MenuItem>
                  <MenuItem onClick={handleClose} value={1}>Taiko</MenuItem>
                  <MenuItem onClick={handleClose} value={2}>Catch the Beat</MenuItem>
                  <MenuItem onClick={handleClose} value={3}>Mania</MenuItem>
                  <Divider></Divider>
                  <MenuItem onClick={handleClose} value={4}>All</MenuItem>
                </Menu>
              </FormControl>
              <Button
                onClick={handleFilter}
                variant="contained"
                color="secondary"
                className={classes.button}
                startIcon={filterIcon}
              >
                Filters
      </Button>
            </Box>
            <Box m={0} p={0} flexGrow={1}>
              <div className={classes.search}>
                <TextField fullWidth
                  className={classes.input}
                  placeholder="Search..."
                  value={localSearch}
                  onChange={handleSearch}
                  inputProps={{ 'aria-label': 'search', className: classes.input }}
                />
              </div>
            </Box>
          </Grid>
        </Toolbar>
      </AppBar>
      <Collapse in={!open}>
        <Container>
          <FormGroup row>
            <Grid container item xs={12} md={10}>
              <Grid item xs={12}>
                <br></br>
                <Typography variant="h5">Mods</Typography>
              </Grid>

              <Grid item xs={6} md>
                <FormControlLabel className={classes.radio}
                  control={<Checkbox onChange={handleModChecked} value={64} checked={checkedDT} indeterminate={indetermineDT} name="DT" />}
                  label="Double Time"
                />
              </Grid>
              <Grid item xs={6} md>
                <FormControlLabel className={classes.radio}
                  control={<Checkbox onChange={handleModChecked} value={256} checked={checkedHT} indeterminate={indetermineHT} name="HT" />}
                  label="Half Time"
                />
              </Grid>
              <Grid item xs={6} md>
                <FormControlLabel className={classes.radio}
                  control={<Checkbox onChange={handleModChecked} checked={checkedHD} indeterminate={indetermineHD} value={8} name="HD" />}
                  label="Hidden"
                />
              </Grid>
              <Grid item xs={6} md>
                <FormControlLabel className={classes.radio}
                  control={<Checkbox onChange={handleModChecked} checked={checkedHR} indeterminate={indetermineHR} value={16} name="HR" />}
                  label="Hard Rock"
                />
              </Grid>
              <Grid item xs={6} md>
                <FormControlLabel className={classes.radio}
                  control={<Checkbox onChange={handleModChecked} checked={checkedEZ} indeterminate={indetermineEZ} value={2} name="EZ" />}
                  label="Easy"
                />
              </Grid>
              <Grid item xs={6} md>
                <FormControlLabel className={classes.radio}
                  control={<Checkbox onChange={handleModChecked} checked={checkedFL} indeterminate={indetermineFL} value={1024} name="FL" />}
                  label="Flashlight"
                />
              </Grid>
              <Grid item xs={6} md>
                <FormControlLabel className={classes.radio}
                  control={<Checkbox onChange={handleModChecked} checked={checkedNO} indeterminate={indetermineNO} value={-1} name="NO" />}
                  label="No Mod"
                />
              </Grid>

            </Grid>
          </FormGroup>
          <br></br>
          <Grid container>
            <Grid container item xs={12} md={6}>
              <Grid item xs={12}>
                <Typography variant="h5">PP Options</Typography>
              </Grid>
              <Grid item xs={6}>
                <Box mr={2}>
                  <TextField fullWidth id="mpp" type="number" value={localMinPP} onChange={handleMinPP} inputProps={{ inputMode: 'decimal' }} label="Min PP" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box mr={2}>
                  <TextField fullWidth id="xpp" type="number" value={localMaxPP} onChange={handleMaxPP} inputProps={{ inputMode: 'decimal' }} label="Max PP" />
                </Box>
              </Grid>
            </Grid>
            <Grid container item xs={12} md={6}>
              <Grid item xs={12}>
                <Hidden mdUp>
                  <br></br>
                </Hidden>
                <Typography variant="h5">Date Ranked Options</Typography>
              </Grid>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={6}>
                  <Box mr={2}>
                    <DatePicker
                      autoOk
                      fullWidth
                      variant="inline"
                      format="MMM-dd-yyyy"
                      margin="normal"
                      id="beginDatePicker"
                      label="Begin Date"
                      value={localMinDate}
                      onChange={handleMinDate}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box mr={2}>
                    <DatePicker
                      autoOk
                      fullWidth
                      variant="inline"
                      format="MMM-dd-yyyy"
                      margin="normal"
                      id="endDatePicker"
                      label="End Date"
                      value={localMaxDate}
                      onChange={handleMaxDate}
                    />
                  </Box>
                </Grid>
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
          <br></br>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h5">Song Options</Typography>
            </Grid>
            <Grid container item md={6} xs={12}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={6}>
                  <Box mr={2}>
                    <KeyboardTimePicker
                      fullWidth
                      ampm={false}
                      openTo="minutes"
                      views={["minutes", "seconds"]}
                      format="mm:ss"
                      margin="normal"
                      id="minLenPicker"
                      label="Min Length"
                      value={localMinLen}
                      onChange={handleMinLen}
                      keyboardIcon={<QueryBuilderIcon />}
                      KeyboardButtonProps={{
                        'aria-label': 'change time',
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box mr={2}>
                    <KeyboardTimePicker
                      fullWidth
                      ampm={false}
                      openTo="minutes"
                      views={["minutes", "seconds"]}
                      format="mm:ss"
                      margin="normal"
                      id="maxLenPicker"
                      label="Max Length"
                      value={localMaxLen}
                      onChange={handleMaxLen}
                      keyboardIcon={<QueryBuilderIcon />}
                      KeyboardButtonProps={{
                        'aria-label': 'change time',
                      }}
                    />
                  </Box>
                </Grid>
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid container item md={6}>
              <Grid item xs={6} md={6}>
                <Hidden mdUp>
                  <Box mr={2}>
                    <TextField id="mb" fullWidth type="number" value={localMinBPM} onChange={handleMinBPM} inputProps={{ inputMode: 'decimal' }} label="Min BPM" />
                  </Box>
                </Hidden>
                <Hidden smDown>
                  <Box mr={2}>
                    <TextField id="mb" fullWidth type="number" value={localMinBPM} onChange={handleMinBPM} inputProps={{ inputMode: 'decimal' }} label="Min BPM" />
                  </Box>
                </Hidden>
              </Grid>
              <Grid item xs={6} md={6}>
                <Hidden mdUp>
                  <Box mr={2}>
                    <TextField id="xb" fullWidth type="number" value={localMaxBPM} onChange={handleMaxBPM} inputProps={{ inputMode: 'decimal' }} label="Max BPM" />
                  </Box>
                </Hidden>
                <Hidden smDown>
                  <Box mr={2}>
                    <TextField id="xb" fullWidth type="number" value={localMaxBPM} onChange={handleMaxBPM} inputProps={{ inputMode: 'decimal' }} label="Max BPM" />
                  </Box>
                </Hidden>
              </Grid>
            </Grid>
          </Grid>
          <br></br>
          <Sliders
            filters={props.filters}
            setFilters={props.setFilters}
            mode={modeVal}
            reset={reset}
            setReset={setReset}
          />
          <br></br>
          <Grid container item justify="space-evenly" alignContent="center" spacing={2}>
            <Grid item>
              <Button variant="contained" onClick={handleFilterReset} color="secondary">
                Reset Filter
            </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleFilterApply} color="primary">
                Apply Filter
            </Button>
            </Grid>
          </Grid>
        </Container>
        <br></br>
      </Collapse>

    </div>
  );
});