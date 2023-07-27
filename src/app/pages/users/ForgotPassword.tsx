import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ForgotPasswordSchema } from '../../models/validators/FormValidators'
import { TextField } from '../../components/form/TextField'
import { FormError } from '../../components/form/FormError'
import { sendForgotPassword } from '../../axios/http/userRequests'
import { Button, Card, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { forgotPasswordResponse } from '../../models/enums/responseEnums'
import useNotification from 'antd/es/notification/useNotification'

interface Username {
    username: string
}

export const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<Username>({ resolver: yupResolver(ForgotPasswordSchema) })
    const navigate = useNavigate()
    const [api, contextHolder] = useNotification()
    const onSubmit = ({ username }: Username) => {
        sendForgotPassword({ username })
            .then(({ detail }) => {
                api.open(forgotPasswordResponse[detail])
            })
            .catch(({ detail }) => setError('root', { message: detail }))
    }

    return (
        <div>
            <div style={{ textAlign: 'left' }}>{contextHolder}</div>
            <Space className='mainScreen'>
                <Card title={'Forgot your password?'}>
                    <p>Please provide your username, phone, or email, and we'll send you a password reset link.</p>
                    <form onSubmit={handleSubmit(onSubmit)} className={'modalForm'}>
                        <div className='p-2 mw-350'>
                            <TextField
                                register={register('username')}
                                label=''
                                placeholder={'Username, Phone, or Email'}
                                error={errors.username}
                            />
                            <FormError error={errors.root?.message} />
                            <Space className={'w-100 justify-between'}>
                                <Button type='primary' htmlType='submit'>
                                    Submit
                                </Button>
                                <p>
                                    Remember your password?{' '}
                                    <Button onClick={() => navigate('/login')} type={'link'}>
                                        Log in here
                                    </Button>
                                </p>
                            </Space>
                        </div>
                    </form>
                </Card>
            </Space>
        </div>
    )
}

// <div className='mainScreen'>
//     <div className='card'>
//         <h2>Forgot Your Password?</h2>
//
//         <form onSubmit={handleSubmit(onSubmit)} className='modalForm'>
//             <div className='p-2 mw-350'>
//                 <input
//                     type='text'
//                     {...register('username')}
//                     placeholder='Username, Phone, or Email'
//                     className={errors.username ? 'input-error' : ''}
//                 />
//                 {errors.username && <span className='error-message'>{errors.username.message}</span>}
//
//                 <button type='submit' disabled={isSubmitting}>
//                     {isSubmitting ? 'Sending...' : 'Send Reset Link'}
//                 </button>
//             </div>
//         </form>
//         <p>
//             Remember your password? <Link to='/login'>Log in here</Link>
//         </p>
//     </div>
// </div>
