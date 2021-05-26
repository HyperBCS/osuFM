import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
    toTop: {
        zIndex: 2,
        position: 'fixed',
        bottom: '5vh',
        boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;',
        backgroundColor: '#1976d2',
        color: '#fff',
        "&:hover, &.Mui-focusVisible": {
            transition: '0.3s',
            backgroundColor: '#2196f3'
        },
        [theme.breakpoints.up('xs')]: {
            right: '3%',
        },
        [theme.breakpoints.up('lg')]: {
            right: '4.5%',
        },
    }
})
)

const Scroll = (
    props: { showBelow: any }
) => {

    const classes = useStyles();

    const [show, setShow] = useState(props.showBelow ? false : true)

    const handleScroll = () => {
        if (props.showBelow.current.getBoundingClientRect().top < 0) {
            if (!show) setShow(true)
        } else {
            if (show) setShow(false)
        }
    }

    const handleClick = () => {
        window["scrollTo"]({ top: 0, behavior: "smooth" })
    }

    useEffect(() => {
        if (props.showBelow) {
            window.addEventListener("scroll", handleScroll)
            return () => window.removeEventListener("scroll", handleScroll)
        }
    })

    return (
        <div>
            {show &&
                <IconButton onClick={handleClick} className={classes.toTop} aria-label="to top" component="span">
                    <ExpandLessIcon />
                </IconButton>
            }
        </div>
    )
}
export default Scroll