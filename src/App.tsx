import React from 'react';
import DataTable from './components/Table'
import { SearchBar } from './components/Search'
import Header from './components/Header'
import Footer from './components/Footer'
import { Box, Grid } from '@material-ui/core';
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import MyTheme from './components/MyTheme'
import Scroll from './components/Scroll'


let Filters = {
  search: "",
  mode: 0,
  mods_enabled: false,
  req_mods: 0,
  opt_mods: 0,
  min_pp: 0,
  max_pp: Number.MAX_SAFE_INTEGER,
  min_date: new Date('2007-09-16T00:00:01').valueOf() / 1000,
  max_date: new Date().valueOf() / 1000,
  min_len: new Date('2007-09-16T00:00:00').getMinutes() * 60 +  new Date('2007-09-16T00:00:00').getSeconds() ,
  max_len: new Date('2007-09-16T23:59:59').getMinutes() * 60 +  new Date('2007-09-16T23:59:59').getSeconds() ,
  min_bpm: 0,
  max_bpm: Number.MAX_SAFE_INTEGER,
  min_diff: 0,
  max_diff: 15,
  min_ar: 0,
  max_ar: 11,
  min_cs: 0,
  max_cs: 10
}

function App() {
  const [mapData, setMapData] = React.useState([]);
  const [resultCount, setCount] = React.useState(0);
  const [filters, setFilters] = React.useState(Filters);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const endPage = React.useRef(null)
  const afterHeader = React.useRef<HTMLDivElement>(null)
  const [theme, setTheme] = React.useState(createMuiTheme(MyTheme));


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Scroll showBelow={afterHeader} />
      <Box display="flex"
        justifyContent="center">
        <Grid item xs={11}>

          <Header theme={theme} setTheme={setTheme} />
          <SearchBar loading={loading} setLoading={setLoading} mapData={mapData} setMapData={setMapData} resultCount={resultCount} setCount={setCount} filters={filters} setFilters={setFilters} page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} />
          <div ref={afterHeader} />
          <DataTable loading={loading} setLoading={setLoading} mapData={mapData} setMapData={setMapData} resultCount={resultCount} setCount={setCount} filters={filters} setFilters={setFilters} page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} endPage={endPage} />
          <div ref={endPage} />

          <Footer />
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App;
