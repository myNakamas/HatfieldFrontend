import { ArgsProps } from 'antd/es/notification/interface'

export const forgotPasswordResponse: { [key: string]: ArgsProps } = {
    email: {
        message: 'Password Reset Email Sent',
        description:
            'We have sent an email to your registered email address with instructions on how to reset your password. Please check your inbox and follow the provided link to reset your password.',
        placement: 'bottom',
        duration: 0,
    },
    phone: {
        message: 'Password Reset SMS Message Sent',
        description:
            'We have sent a message to your registered phone number with instructions on how to reset your password. Please check your phone and follow the provided link to reset your password.',

        placement: 'bottom',
        duration: 0,
    },
}
