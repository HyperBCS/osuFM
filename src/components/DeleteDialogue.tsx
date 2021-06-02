import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Box } from '@material-ui/core';

interface Input {
    openDelete: any;
    setDelete: any;
    profiles: any;
    setProfiles: any;
    selectedProfile: any;
}

export default function FormDialog(props: Input) {

    const handleAdd = () => {
        let tmp_profiles = props.profiles
        props.setDelete(false);
        tmp_profiles = []
        props.profiles.forEach(function (profile: any) {
            if (profile.name != props.selectedProfile) {
                tmp_profiles.push(profile)
            }
        });
        props.setProfiles(tmp_profiles)
        window.localStorage.setItem("profiles", JSON.stringify(tmp_profiles));
    };

    const handleClose = () => {
        props.setDelete(false);
    };

    return (
        <div>
            <Dialog open={props.openDelete} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Delete Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The profile named <Box component="span" display="inline" fontWeight="fontWeightBold">{props.selectedProfile}</Box> will be deleted!
          </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={handleAdd} color="primary">
                        Confirm
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}