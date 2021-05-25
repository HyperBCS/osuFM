import { Box, Grid, Hidden, TableBody, Typography } from '@material-ui/core';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Skeleton from '@material-ui/lab/Skeleton';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import GamepadIcon from '@material-ui/icons/Gamepad';
import StarIcon from '@material-ui/icons/Star';



export function SkeletonTable(props: { rowsPerPage: any }) {





    const mobileTable = Array(props.rowsPerPage).fill(0).map((_, i) => (
        <TableRow key={i}>
            <TableCell align="left">
                <Grid container>
                    <Grid item style={{ marginRight: 'auto' }}>
                        <Skeleton variant="rect" width={80} height={60} />
                    </Grid>
                    <Grid item xs><Box ml={1}><Skeleton variant="text" />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                    </Box>
                    </Grid>
                </Grid>
                <Grid container justify="space-around">
                    <Box>
                        <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" ><GamepadIcon /></Box>
                            <Box display="flex" justifyContent="center"  ><Skeleton variant="text" width={32} height={24} /></Box>
                        </Grid>
                    </Box>
                    <Box>
                        <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">PP</Box>
                            <Box display="flex" justifyContent="center" ><Skeleton variant="text" width={32} height={24} /></Box>
                        </Grid>
                    </Box>
                    <Box>
                        <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">Acc</Box>
                            <Box display="flex" justifyContent="center" ><Skeleton variant="text" width={32} height={24} /></Box>
                        </Grid>
                    </Box>
                    <Box>
                        <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">Mods</Box>
                            <Box display="flex" justifyContent="center" ><Skeleton variant="text" width={32} height={24} /></Box>
                        </Grid>
                    </Box>
                    <Box>
                        <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center"><WatchLaterIcon /></Box>
                            <Box display="flex" justifyContent="center" ><Skeleton variant="text" width={32} height={24} /></Box>
                        </Grid>
                    </Box>
                    <Box>
                        <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center" fontWeight="fontWeightBold">BPM</Box>
                            <Box display="flex" justifyContent="center" ><Skeleton variant="text" width={32} height={24} /></Box>
                        </Grid>
                    </Box>
                    <Box>
                        <Grid item>
                            <Box display="flex" justifyContent="center" height={24} alignItems="center"><StarIcon /></Box>
                            <Box display="flex" justifyContent="center" ><Skeleton variant="text" width={32} height={24} /></Box>
                        </Grid>
                    </Box>
                </Grid>
            </TableCell>
        </TableRow>
    ))

    const desktopTable = Array(props.rowsPerPage).fill(0).map((_, i) => (
        <TableRow key={i}>
            <TableCell align="left"><Skeleton variant="text" /></TableCell>
            <TableCell><Skeleton variant="rect" width={80} height={60} /></TableCell>
            <TableCell component="th" scope="row" width="45%">
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
            </TableCell>
            <TableCell align="center"><Skeleton variant="text" /></TableCell>
            <TableCell align="center"><Skeleton variant="text" /></TableCell>
            <TableCell align="center"><Skeleton variant="text" /></TableCell>
            <TableCell align="center"><Skeleton variant="text" /></TableCell>
            <TableCell align="center"><Skeleton variant="text" /></TableCell>
            <TableCell align="center"><Skeleton variant="text" /></TableCell>
            <TableCell align="center"><Skeleton variant="text" /></TableCell>
        </TableRow>
    ))

    return (
        <TableBody>
            {/* Mobile View */}
            <Hidden mdUp>
                {mobileTable}
            </Hidden>
            {/* Desktop View */}
            <Hidden smDown>
                {desktopTable}
            </Hidden>

        </TableBody>

    );
}