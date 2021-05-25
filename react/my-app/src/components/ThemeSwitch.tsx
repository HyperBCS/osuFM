import React from "react";
import { createMuiTheme } from "@material-ui/core/styles";
import { Switch, Box } from "@material-ui/core";
import { PaletteType } from '@material-ui/core';
import MyTheme from './MyTheme'
import Brightness3Icon from '@material-ui/icons/Brightness3';
import WbSunnyIcon from '@material-ui/icons/WbSunny';


const ThemeSwitcher = (props: { theme: any; setTheme: any }) => {

    const [themeLoaded, setloadState] = React.useState(false);

    React.useEffect(() => {
        if(!themeLoaded){
            setloadState(true)
            let savedTheme = window.localStorage.getItem("theme")
            if(savedTheme === null){
                savedTheme = "dark"
            }
            setMode(savedTheme)
            setTheme(savedTheme)
        }
      });

    const toggleDarkMode = () => {
        let newMode = (themeMode === "light") ? "dark" : "light"
        setMode(newMode)
        setTheme(newMode)
    };

    const setTheme = (theme: string) => {
        window.localStorage.setItem("theme", theme);
        const updatedTheme = MyTheme
        updatedTheme.palette.type = theme as PaletteType
        props.setTheme(createMuiTheme(updatedTheme));
    }

    const [themeMode, setMode] = React.useState("dark");
    return (
        <Box display="flex"
            justifyContent="space-between" alignItems="center">
            <Brightness3Icon />
            <Switch onChange={toggleDarkMode} checked={(themeMode == "light") ? true : false}/>
            <WbSunnyIcon />
        </Box>
    );
};

export default ThemeSwitcher;
