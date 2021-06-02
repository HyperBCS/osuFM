import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface Input {
    openRename: any;
    setRename: any;
    profiles: any;
    setProfiles: any;
    selectedProfile: any;
    setSelected: any;
}

export default function FormDialog(props: Input) {

    const [profileName, setName] = React.useState("");

    const [errorState, setError] = React.useState(false);

    const [errMsg, setErrMsg] = React.useState("");


    function checkDuplicate(name: string) {
        let found = false
        props.profiles.forEach(function (profile: any) {
            if (profile.name === name && profile.name != props.selectedProfile) {
                found = true
            }
        });
        return found
    }

    const handleAdd = () => {
        let tmp_profiles = props.profiles
        if (profileName.length > 0) {
            tmp_profiles = []
            let changed = false
            props.profiles.forEach(function (profile: any) {
                if (profile.name === props.selectedProfile && !checkDuplicate(profileName)) {
                    let tmp_profile = { name: profileName, profile: profile.profile }
                    tmp_profiles.push(tmp_profile)
                    changed = true
                } else if (checkDuplicate(profileName)) {
                    setError(true)
                    setErrMsg("Profile name already exists")
                    return
                } else {
                    tmp_profiles.push(profile)
                }
            });
            if (changed) {
                props.setRename(false);
                props.setProfiles(tmp_profiles)
                window.localStorage.setItem("profiles", JSON.stringify(tmp_profiles));
                setName("")
            }
        } else {
            props.setRename(false);
            setError(false)
            setErrMsg("")
            setName("")
        }

    };

    const handleClose = () => {
        setName("")
        setErrMsg("")
        setError(false)
        props.setRename(false);
    };

    const handleName = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    };

    return (
        <div>
            <Dialog open={props.openRename} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Rename Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the new name for this profile.
          </DialogContentText>
                    <TextField
                        autoFocus
                        error={errorState}
                        helperText={errMsg}
                        value={profileName}
                        placeholder={props.selectedProfile}
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
                        Rename
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}