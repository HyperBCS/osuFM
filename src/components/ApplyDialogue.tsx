import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Box } from '@material-ui/core';

interface Input {
    openApply: any;
    setApply: any;
    filters: any;
    setFilters: any;
    profiles: any;
    setProfiles: any;
    selectedProfile: any;
    handleRefresh: any;
}

export default function FormDialog(props: Input) {

    const handleApply = () => {
        props.profiles.forEach(function (profile: any) {
            if (profile.name === props.selectedProfile) {
                let tmp_profile = profile.profile
                tmp_profile.mode = props.filters.mode
                props.setFilters(tmp_profile)
                props.handleRefresh(tmp_profile)
            }
        });
        props.setApply(false);
    };

    const handleClose = () => {
        props.setApply(false);
    };

    return (
        <div>
            <Dialog open={props.openApply} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Apply Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to load the profile named <Box component="span" display="inline" fontWeight="fontWeightBold">{props.selectedProfile}</Box>?
          </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={handleApply} color="primary">
                        Apply
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}