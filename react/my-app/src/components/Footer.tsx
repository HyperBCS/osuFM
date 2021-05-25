

import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Link } from '@material-ui/core';
import React, { useEffect } from 'react';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            margin: theme.spacing(1),
        },
        root: {
            flexGrow: 1,
            width: '100%'
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