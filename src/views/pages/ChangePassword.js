import { Button, FormControl, FormHelperText, Grid, InputLabel, OutlinedInput } from '@mui/material';
import { Box, Container } from '@mui/system';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword } from 'store/user/userActions';
import BackDropLoading from 'views/utilities/BackDropLoading';
import { useNavigate } from 'react-router';


const validation = yup.object({
    currentPassword: yup
      .string('Enter your Old Password')
      .required('Current Password is required'),
    newPassword: yup
      .string('Enter your New password')
      .required('New Password is required')
      .matches(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})",
        "Must Contain 6 Characters, One Uppercase, One Lowercase, and One Number"
      ),
    cnewPassword: yup
      .string('Enter password')
      .required('Repate New Password is required')
      .oneOf([yup.ref("newPassword"), null], "Passwords must match")
});


function ChangePassword (){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.user.user);
    const loading = useSelector((state) => state.user.loading);

    const formik = useFormik({
        enableReinitialize:true,
        validateOnMount: true,
        initialValues: {
            userId: userData.userId,
            currentPassword: '',
            newPassword: '',
            cnewPassword: ''
        },
        validationSchema: validation,
        onSubmit: (values) => {
            // console.log(values)
            dispatch(updatePassword(values, navigate))
        }
    });
    return(<>
        {loading ? <BackDropLoading /> : null}
        <MainCard title="Change Passsword">
            <Container>
                <Box component="form" noValidate onSubmit={formik.handleSubmit} autoComplete="off">
                    <Grid Container spacing={2} style={{maxWidth: 500, margin: '0 auto'}}>
                        <Grid item xs={4} sm={4}>
                            <FormControl required fullWidth error={Boolean(formik.touched.currentPassword && formik.errors.currentPassword)} sx={{mb: 2}}>
                                <InputLabel htmlFor="currentPassword">Current Password</InputLabel>
                                <OutlinedInput
                                    id="currentPassword"
                                    type="password"
                                    value={formik.values.currentPassword}
                                    name="currentPassword"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Current Password"
                                />
                                {formik.touched.currentPassword && formik.errors.currentPassword && (
                                    <FormHelperText error id="standardcurrentPassword">
                                    {formik.errors.currentPassword}
                                    </FormHelperText>
                                )}
                            </FormControl>
                            <FormControl required fullWidth error={Boolean(formik.touched.newPassword && formik.errors.newPassword)} sx={{mb: 2}}>
                                <InputLabel htmlFor="newPassword">New Password</InputLabel>
                                <OutlinedInput
                                    id="newPassword"
                                    type="password"
                                    value={formik.values.newPassword}
                                    name="newPassword"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="New Password"
                                />
                                {formik.touched.newPassword && formik.errors.newPassword && (
                                    <FormHelperText error id="standardnewPassword">
                                    {formik.errors.newPassword}
                                    </FormHelperText>
                                )}
                            </FormControl>
                            <FormControl required fullWidth error={Boolean(formik.touched.cnewPassword && formik.errors.cnewPassword)} sx={{mb: 2}}>
                                <InputLabel htmlFor="cnewPassword">Repate New Password</InputLabel>
                                <OutlinedInput
                                    id="cnewPassword"
                                    type="password"
                                    value={formik.values.cnewPassword}
                                    name="cnewPassword"
                                    onBlur={formik.handleBlur}
                                    onChange={formik.handleChange}
                                    label="Repate Password"
                                />
                                {formik.touched.cnewPassword && formik.errors.cnewPassword && (
                                    <FormHelperText error id="standardcnewPassword">
                                    {formik.errors.cnewPassword}
                                    </FormHelperText>
                                )}
                            </FormControl>
                            <Button fullWidth size="large" type="submit" variant="contained" color="secondary">
                                Change Password
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </MainCard>
    </>)
}

export default ChangePassword;

// curl -X 'POST' \
//   'https://localhost:7204/api/Auth/changepass' \
//   -H 'accept: /' \
//   -H 'Content-Type: multipart/form-data' \
//   -F 'userId=d5d62079-91bd-44f4-8ed5-1df7bd667682' \
//   -F 'currentPassword=Tds.123' \
//   -F 'newPassword=Tds.123'
