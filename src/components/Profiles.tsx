import React, { useEffect } from "react";
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Box, Grid, Hidden, makeStyles, Tooltip } from '@material-ui/core';
import ProfileName from './ProfileName'
import ApplyDialogue from './ApplyDialogue'
import RenameDialogue from './RenameDialogue'
import DeleteDialogue from './DeleteDialogue'
import UpdateProfiles from './UpdateProfile'
import CheckIcon from '@material-ui/icons/Check';
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';


const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            minWidth: 600,
            padding: theme.spacing(2),
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
    });

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
    table: {
    },
    typography: {
        fontSize: '0.7rem',
    }
});

export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

interface Input {
    profileOpen: any;
    setProfileOpen: any;
    filters: any;
    setFilters: any;
    handleRefresh: any;
}

export const Profiles = React.memo(function SearchBar(props: Input) {

    const [profiles, setProfiles] = React.useState([]);

    const [initialLoad, setInitial] = React.useState(false);

    const [selectedProfile, setSelected] = React.useState("");

    const [openProfileName, setProfileName] = React.useState(false);

    const [openApply, setApply] = React.useState(false);

    const [openRename, setRename] = React.useState(false);

    const [openDelete, setDelete] = React.useState(false);

    const [openUpdate, setUpdate] = React.useState(false);

    const classes = useStyles();

    const handleClose = () => {
        props.setProfileOpen(false);
    };

    const addProfile = () => {
        setProfileName(true)

        // props.setProfileOpen(false);
    };

    const loadProfiles = async () => {
        setInitial(true)
        let savedProfiles = window.localStorage.getItem("profiles")
        if (savedProfiles != null) {
            let profileParsed = JSON.parse(savedProfiles);
            setProfiles(profileParsed)
        }

    };

    useEffect(() => {
        if (!initialLoad) {
            loadProfiles()
        }

    });

    const handleApply = (pName: string) => {
        setSelected(pName)
        setApply(true)
    }

    const handleRename = (pName: string) => {
        setSelected(pName)
        setRename(true)
    }

    const handleDelete = (pName: string) => {
        setSelected(pName)
        setDelete(true)
    }

    const handleSave = (pName: string) => {
        setSelected(pName)
        setUpdate(true)
    }

    return (
        <div>
            <ProfileName openProfileName={openProfileName} setProfileName={setProfileName} filters={props.filters} profiles={profiles} setProfiles={setProfiles}></ProfileName>
            <ApplyDialogue handleRefresh={props.handleRefresh} openApply={openApply} setApply={setApply} filters={props.filters} profiles={profiles} setProfiles={setProfiles} selectedProfile={selectedProfile} setFilters={props.setFilters}></ApplyDialogue>
            <RenameDialogue openRename={openRename} setRename={setRename} profiles={profiles} setProfiles={setProfiles} selectedProfile={selectedProfile} setSelected={setSelected}></RenameDialogue>
            <DeleteDialogue openDelete={openDelete} setDelete={setDelete} profiles={profiles} setProfiles={setProfiles} selectedProfile={selectedProfile}></DeleteDialogue>
            <UpdateProfiles openUpdate={openUpdate} setUpdate={setUpdate} filters={props.filters} profiles={profiles} setProfiles={setProfiles} selectedProfile={selectedProfile}></UpdateProfiles>
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={props.profileOpen}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Saved Filter Profiles
        </DialogTitle>
                <DialogContent dividers>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="custom pagination table">
                            <TableBody>
                                {/* Desktop View */}
                                {profiles.map((row: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Grid container justify="space-between">
                                                <Box display="flex" alignItems="center">
                                                    <Grid item>
                                                        <Typography>{row.name}</Typography>

                                                    </Grid>
                                                </Box>
                                                <Box display="flex">
                                                    <Grid item>
                                                        <Tooltip title="Apply Profile" placement="top"><IconButton aria-label="Apply Profile" component="span" onClick={() => { handleApply(row.name) }}><CheckIcon /></IconButton></Tooltip>
                                                        <Tooltip title="Overwrite profile" placement="top"><IconButton aria-label="Overwrite Profile" component="span" onClick={() => { handleSave(row.name) }}><SaveIcon /></IconButton></Tooltip>
                                                        <Tooltip title="Rename Profile" placement="top"><IconButton aria-label="Rename Profile" component="span" onClick={() => { handleRename(row.name) }}><CreateIcon /></IconButton></Tooltip>
                                                        <Tooltip title="Delete Profile" placement="top"><IconButton aria-label="Delete Profile" component="span" onClick={() => { handleDelete(row.name) }}><DeleteIcon /></IconButton></Tooltip>
                                                    </Grid>
                                                </Box>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={addProfile} color="primary">
                        Add Profile
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
});
