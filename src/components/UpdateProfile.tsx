import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Box } from '@material-ui/core';

interface Input {
    openUpdate: any;
    setUpdate: any;
    filters: any;
    profiles: any;
    setProfiles: any;
    selectedProfile: any;
}

export default function FormDialog(props: Input) {

    const handleAdd = () => {
        let tmp_profiles = props.profiles
        props.setUpdate(false);
        tmp_profiles = []
        props.profiles.forEach(function (profile: any) {
            if (profile.name == props.selectedProfile) {
                let tmp_filter = Object.assign({}, props.filters)
                let tmp_profile = { name: profile.name, profile: tmp_filter }
                tmp_profiles.push(tmp_profile)
            } else {
                tmp_profiles.push(profile)
            }
        });
        props.setProfiles(tmp_profiles)
        window.localStorage.setItem("profiles", JSON.stringify(tmp_profiles));
    };

    const handleClose = () => {
        props.setUpdate(false);
    };

    return (
        <div>
            <Dialog open={props.openUpdate} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Overwrite Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The profile named <Box component="span" display="inline" fontWeight="fontWeightBold">{props.selectedProfile}</Box> will be overwritten with the current filters!
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