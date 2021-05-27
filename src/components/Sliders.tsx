import { Grid, Slider, TextField, Tooltip, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';



interface Input {
  filters: any;
  setFilters: any;
  mode: any;
  reset: any;
  setReset: any;
}

interface Props {
  children: React.ReactElement;
  open: boolean;
  value: number;
}

function ValueLabelComponent(props: Props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
      {children}
    </Tooltip>
  );
}


export const Sliders = React.memo(function Sliders(props: Input) {


  const [localMinDiff, setMinDiff] = React.useState("0");
  const [localMaxDiff, setMaxDiff] = React.useState("15");

  const [localMinAR, setMinAR] = React.useState("0");
  const [localMaxAR, setMaxAR] = React.useState("11");

  const [localMinCS, setMinCS] = React.useState("0");
  const [localMaxCS, setMaxCS] = React.useState("10");

  const [valueStars, setValueStars] = React.useState<number[]>([0, 15]);

  const [valueAR, setValueAR] = React.useState<number[]>([0, 11]);

  const [valueCS, setValueCS] = React.useState<number[]>([0, 10]);


  function doReset() {
    props.setReset(false)
    setMinDiff("0")
    setMaxDiff("15")
    setMinAR("0")
    setMaxAR("11")
    setMinCS("0")
    setMaxCS("10")
    setValueStars([0, 15])
    setValueAR([0, 11])
    setValueCS([0, 10])
  }

  useEffect(() => {
    if (props.reset) {
      doReset()
    }
  });


  const handleStars = (event: any, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      let filter_tmp = props.filters
      filter_tmp.min_diff = newValue[0]
      filter_tmp.max_diff = newValue[1]
      setMinDiff(newValue[0].toString())
      setMaxDiff(newValue[1].toString())
    }
    setValueStars(newValue as number[]);
  };

  const handleAR = (event: any, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      let filter_tmp = props.filters
      filter_tmp.min_ar = newValue[0]
      filter_tmp.max_ar = newValue[1]
      setMinAR(newValue[0].toString())
      setMaxAR(newValue[1].toString())
    }
    setValueAR(newValue as number[]);
  };

  const handleCS = (event: any, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      let filter_tmp = props.filters
      filter_tmp.min_cs = newValue[0]
      filter_tmp.max_cs = newValue[1]
      setMinCS(newValue[0].toString())
      setMaxCS(newValue[1].toString())
    }
    setValueCS(newValue as number[]);
  };

  const handleMinAR = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    setMinAR(event.target.value)
    if (parseFloat(event.target.value) > props.filters.max_ar && parseFloat(event.target.value) <= 11) {
      filter_tmp.min_ar = parseFloat(localMaxAR)
      filter_tmp.max_ar = parseFloat(event.target.value)
      setValueAR([parseFloat(localMaxAR), parseFloat(event.target.value)])
      setMaxAR(event.target.value)
      setMinAR(localMaxAR)
    } else if (parseFloat(event.target.value) >= 0 && parseFloat(event.target.value) <= 11) {
      setValueAR([parseFloat(event.target.value), parseFloat(props.filters.max_ar)])
      filter_tmp.min_ar = event.target.value
    } else if (event.target.value.length == 0) {
      filter_tmp.min_ar = 0
      setValueAR([0, props.filters.max_ar])
    } else {
      filter_tmp.min_ar = 0
      setMinAR("0")
      setValueAR([0, props.filters.max_ar])
    }
    props.setFilters(filter_tmp)
  };

  const handleMaxAR = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    setMaxAR(event.target.value)
    if (parseFloat(event.target.value) < props.filters.min_ar && parseFloat(event.target.value) <= 11) {
      filter_tmp.max_ar = parseFloat(localMinAR)
      filter_tmp.min_ar = parseFloat(event.target.value)
      setValueAR([parseFloat(event.target.value), parseFloat(localMinAR)])
      setMinAR(event.target.value)
      setMaxAR(localMinAR)
    } else if (parseFloat(event.target.value) >= 0 && parseFloat(event.target.value) <= 11) {
      setValueAR([parseFloat(props.filters.min_ar), parseFloat(event.target.value)])
      filter_tmp.max_ar = event.target.value
    } else if (event.target.value.length == 0) {
      filter_tmp.max_ar = 11
      setValueAR([props.filters.min_ar, 11])
    } else {
      filter_tmp.max_ar = 11
      setMaxAR("11")
      setValueAR([props.filters.min_ar, 11])
    }
    props.setFilters(filter_tmp)
  };

  const handleMinCS = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    setMinCS(event.target.value)
    if (parseFloat(event.target.value) > props.filters.max_cs && parseFloat(event.target.value) <= 10) {
      filter_tmp.min_cs = parseFloat(localMaxCS)
      filter_tmp.max_cs = parseFloat(event.target.value)
      setValueCS([parseFloat(localMaxCS), parseFloat(event.target.value)])
      setMaxCS(event.target.value)
      setMinCS(localMaxCS)
    } else if (parseFloat(event.target.value) >= 0 && parseFloat(event.target.value) <= 10) {
      setValueCS([parseFloat(event.target.value), parseFloat(props.filters.max_cs)])
      filter_tmp.min_cs = event.target.value
    } else if (event.target.value.length == 0) {
      filter_tmp.min_cs = 0
      setValueCS([0, props.filters.max_cs])
    } else {
      filter_tmp.min_cs = 0
      setMinCS("0")
      setValueCS([0, props.filters.max_cs])
    }
    props.setFilters(filter_tmp)
  };

  const handleMaxCS = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    setMaxCS(event.target.value)
    if (parseFloat(event.target.value) < props.filters.min_cs && parseFloat(event.target.value) <= 10) {
      filter_tmp.max_cs = parseFloat(localMinCS)
      filter_tmp.min_cs = parseFloat(event.target.value)
      setValueCS([parseFloat(event.target.value), parseFloat(localMinCS)])
      setMinCS(event.target.value)
      setMaxCS(localMinCS)
    } else if (parseFloat(event.target.value) >= 0 && parseFloat(event.target.value) <= 15) {
      setValueCS([parseFloat(props.filters.min_cs), parseFloat(event.target.value)])
      filter_tmp.max_cs = event.target.value
    } else if (event.target.value.length == 0) {
      filter_tmp.max_cs = 10
      setValueCS([props.filters.min_cs, 10])
    } else {
      filter_tmp.max_cs = 10
      setMaxCS("10")
      setValueCS([props.filters.min_cs, 10])
    }
    props.setFilters(filter_tmp)
  };

  const handleMinDiff = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    setMinDiff(event.target.value)
    if (parseFloat(event.target.value) > props.filters.max_diff && parseFloat(event.target.value) <= 15) {
      filter_tmp.min_diff = parseFloat(localMaxDiff)
      filter_tmp.max_diff = parseFloat(event.target.value)
      setValueStars([parseFloat(localMaxDiff), parseFloat(event.target.value)])
      setMaxDiff(event.target.value)
      setMinDiff(localMaxDiff)
    } else if (parseFloat(event.target.value) >= 0 && parseFloat(event.target.value) <= 15) {
      setValueStars([parseFloat(event.target.value), parseFloat(props.filters.max_diff)])
      filter_tmp.min_diff = event.target.value
    } else if (event.target.value.length == 0) {
      filter_tmp.min_diff = 0
      setValueStars([0, props.filters.max_diff])
    } else {
      filter_tmp.min_diff = 0
      setMinDiff("0")
      setValueStars([0, props.filters.max_diff])
    }
    props.setFilters(filter_tmp)
  };

  const handleMaxDiff = (event: React.ChangeEvent<HTMLInputElement>) => {
    let filter_tmp = props.filters
    setMaxDiff(event.target.value)
    if (parseFloat(event.target.value) < props.filters.min_diff && parseFloat(event.target.value) <= 15) {
      filter_tmp.max_diff = parseFloat(localMinDiff)
      filter_tmp.min_diff = parseFloat(event.target.value)
      setValueStars([parseFloat(event.target.value), parseFloat(localMinDiff)])
      setMinDiff(event.target.value)
      setMaxDiff(localMinDiff)
    } else if (parseFloat(event.target.value) >= 0 && parseFloat(event.target.value) <= 15) {
      setValueStars([parseFloat(props.filters.min_diff), parseFloat(event.target.value)])
      filter_tmp.max_diff = event.target.value
    } else if (event.target.value.length == 0) {
      filter_tmp.max_diff = 15
      setValueStars([props.filters.min_diff, 15])
    } else {
      filter_tmp.max_diff = 15
      setMaxDiff("15")
      setValueStars([props.filters.min_diff, 15])
    }
    props.setFilters(filter_tmp)
  };

  function diffText(value: number) {
    return `${value}★`;
  }

  function diffAR(value: number) {
    return `AR ${value}`;
  }

  function diffCS(value: number) {
    return ((props.mode == 3) ? "Keys" : "CS") + ` ${value}`;
  }

  return (
    <Grid item container justify="center">
      <Grid item xs={12}>
        <Typography variant="h5">Difficulty Options</Typography>
      </Grid>
      <Grid container justify="center" item spacing={2} xs={12} md={4}>
        <Grid item xs={10}>
          <Slider
            value={valueStars}
            ValueLabelComponent={ValueLabelComponent}
            min={0}
            max={15}
            step={0.1}
            onChange={handleStars}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            valueLabelFormat={diffText}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField id="md" type="number" value={localMinDiff} onChange={handleMinDiff} inputProps={{ inputMode: 'decimal' }} label="Min Stars" />
        </Grid>
        <Grid item xs={5}>
          <TextField id="xd" type="number" value={localMaxDiff} onChange={handleMaxDiff} inputProps={{ inputMode: 'decimal' }} label="Max Stars" />
        </Grid>
      </Grid>
      <Grid container justify="center" item spacing={2} xs={12} md={4}>
        <Grid item xs={10}>
          <Slider
            value={valueAR}
            ValueLabelComponent={ValueLabelComponent}
            min={0}
            max={11}
            step={0.1}
            onChange={handleAR}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            valueLabelFormat={diffAR}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField id="mar" type="number" value={localMinAR} onChange={handleMinAR} inputProps={{ inputMode: 'decimal' }} label="Min AR" />
        </Grid>
        <Grid item xs={5}>
          <TextField id="xar" type="number" value={localMaxAR} onChange={handleMaxAR} inputProps={{ inputMode: 'decimal' }} label="Max AR" />
        </Grid>
      </Grid>
      <Grid container justify="center" item spacing={2} xs={12} md={4}>
        <Grid item xs={10}>
          <Slider
            value={valueCS}
            ValueLabelComponent={ValueLabelComponent}
            min={0}
            max={10}
            step={(props.mode == 3) ? 1 : 0.1}
            onChange={handleCS}
            valueLabelDisplay="auto"
            aria-labelledby="range-slider"
            valueLabelFormat={diffCS}
          />
        </Grid>
        <Grid item xs={5}>
          <TextField id="mcs" type="number" value={localMinCS} onChange={handleMinCS} inputProps={{ inputMode: 'decimal' }} label={"Min " + ((props.mode == 3) ? "Keys" : "CS")} />
        </Grid>
        <Grid item xs={5}>
          <TextField id="xcs" type="number" value={localMaxCS} onChange={handleMaxCS} inputProps={{ inputMode: 'decimal' }} label={"Max " + ((props.mode == 3) ? "Keys" : "CS")} />
        </Grid>
      </Grid>
    </Grid>
  )
});