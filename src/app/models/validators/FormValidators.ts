import * as Yup from 'yup'

export const LoginSchema = Yup.object().shape({
    username: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
})
export const RegisterSchema = Yup.object().shape({
    username: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
})
