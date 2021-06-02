import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Input {
    openProfileName: any;
    setProfileName: any;
    filters: any;
    profiles: any;
    setProfiles: any;
}

export default function FormDialog(props: Input) {

    const [profileName, setName] = React.useState("");

    const [errorState, setError] = React.useState(false);

    const [errMsg, setErrMsg] = React.useState("");

    const handleClickOpen = () => {
        props.setProfileName(true);
    };

    function checkDuplicate(name: string) {
        let found = false
        props.profiles.forEach(function (profile: any) {
            if (profile.name === name) {
                found = true
            }
        });
        return found
    }

    const handleAdd = () => {
        let tmp_profiles = props.profiles
        if (profileName.length > 0 && !checkDuplicate(profileName)) {
            props.setProfileName(false);
            let tmp_filter = Object.assign({}, props.filters)
            let tmp_profile = { name: profileName, profile: tmp_filter }
            tmp_profiles.push(tmp_profile)
            props.setProfiles(tmp_profiles)
            window.localStorage.setItem("profiles", JSON.stringify(tmp_profiles));
        } else if (checkDuplicate(profileName)) {
            setError(true)
            setErrMsg("Profile name already exists")
            return
        } else {
            setError(true)
            setErrMsg("Profile name must be at least 1 character")
            return
        }
        setName("")
    };

    const handleClose = () => {
        setError(false)
        setErrMsg("")
        props.setProfileName(false);
        setName("")
    };

    const handleName = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    };

    return (
        <div>
            <Dialog open={props.openProfileName} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the name of the profile you wish to save.
          </DialogContentText>
                    <TextField
                        autoFocus
                        error={errorState}
                        helperText={errMsg}
                        value={profileName}
                        onChange={handleName}
                        margin="dense"
                        id="profilename"
                        label="Profile Name"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={handleAdd} color="primary">
                        Add
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}