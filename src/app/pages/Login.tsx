import { UsernamePassword } from '../models/interfaces/user'
import { LoginSchema } from '../models/validators/FormValidators'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '../axios/userRequests'
import { useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
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

export const Login = () => {
    const { setLoggedUser } = useContext(AuthContext)
    const { state } = useLocation()
    const navigate = useNavigate()

    const [errorMsg, setErrorMsg] = useState('')
    //todo:add RememberMe services

    const {
        control,
        handleSubmit,
    } = useForm<UsernamePassword>({ resolver: yupResolver(LoginSchema) })

    const onSubmit = (values: UsernamePassword) => {
        const pageToRedirectTo: Location = state?.from ?? '/home'

        useLogin(values)
            .then((user) => {
                setLoggedUser(user)
                navigate(pageToRedirectTo, { replace: true })
            })
            .catch(() => {
                setErrorMsg('Invalid credentials')
            })
    }

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
                    <Controller control={control} name='username' render={({ field, fieldState }) =>
                        <TextField
                            margin='normal'
                            required
                            fullWidth
                            id='username'
                            label='Email Address'
                            name='username'
                            autoComplete='username'
                            autoFocus
                            error={fieldState.invalid}
                            onChange={field.onChange}
                        />
                    } />
                    <Controller control={control} name='password' render={({ field, fieldState }) =>
                        <TextField
                            margin='normal'
                            required
                            fullWidth
                            name='password'
                            label='Password'
                            type='password'
                            id='password'
                            autoComplete='current-password'
                            error={fieldState.invalid}
                            onChange={field.onChange}
                        />} />
                    {errorMsg.length > 0 && <Alert severity='error'>{errorMsg}</Alert>}
                    <FormControlLabel
                        control={<Checkbox value='remember' color='primary' />}
                        label='Remember me'
                    />
                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        sx={{ mt: 3, mb: 2 }}
                    >
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
