import { LoginUserModel } from '../models/interfaces/user'
import { LoginSchema } from '../models/validators/FormValidators'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '../axios/userRequests'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { Alert } from '@mui/material'
import FormTextField from '../components/FormTextField'

export const Login = () => {
    const { loggedUser, saveLoggedUser } = useContext(AuthContext)
    const { state } = useLocation()
    const navigate = useNavigate()

    const [errorMsg, setErrorMsg] = useState('')

    const { control, handleSubmit } = useForm<LoginUserModel>({ resolver: yupResolver(LoginSchema) })

    const onSubmit = (formValues: LoginUserModel) => {
        setErrorMsg('')
        useLogin(formValues)
            .then((user) => {
                if (loggedUser) {
                    const pageToRedirectTo: Location = state?.from ?? '/welcome'
                    navigate(pageToRedirectTo, { replace: true })
                    saveLoggedUser(user)
                }
            })
            .catch(() => {
                setErrorMsg('Invalid credentials')
            })
    }

    useEffect(() => {
        if (loggedUser) {
            const pageToRedirectTo: Location = state?.from ?? '/welcome'
            navigate(pageToRedirectTo, { replace: true })
        }
    }, [])


    return (
        <Container component='main' maxWidth='xs'>
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <FontAwesomeIcon icon={faUser} />
                </Avatar>
                <Typography component='h1' variant='h5'>
                    Sign in
                </Typography>
                <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    <FormTextField control={control} name='username' label='Username' />
                    <FormTextField control={control} name='password' label='Password' type='password' />
                    {errorMsg.length > 0 && <Alert severity='error'>{errorMsg}</Alert>}
                    <Controller
                        control={control}
                        name='remember'
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Checkbox value='remember' color='primary' />}
                                label='Remember me'
                                onChange={(event, checked) => field.onChange(checked)}
                            />
                        )}
                    />
                    <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href='#' variant='body2'>
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href='#' variant='body2'>
                                {'Don\'t have an account? Sign Up'}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    )
}
