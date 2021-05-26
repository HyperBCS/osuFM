

import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Link } from '@material-ui/core';
import React, { useEffect } from 'react';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            width: '100%'
        },
        typography: {
            fontSize: '0.7rem',
        }
    }),
);

async function componentDidMount(setDate: any) {
    fetch('/static/datemodified')
        .then(response => {
            response.text().then(text => {
                setDate(text)
            });
        });
}


export default function Header() {
    const classes = useStyles();
    const [date, setDate] = React.useState("");

    useEffect(() => {
        if (date.length == 0) {
            componentDidMount(setDate)
        }
    });

    return (
        <div className={classes.root}>
            <Typography color="textSecondary" className={classes.typography} align="center">Created by <Link color="inherit"
                href="https://github.com/hyperbcs">HyperBCS</Link></Typography>
            <Typography color="textSecondary" className={classes.typography} align="center">Database last updated: {date}</Typography>
        </div>
    );
}