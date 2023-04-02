import React from 'react'
import { AppModal } from './AppModal'
import { User } from '../../models/interfaces/user'
import { Descriptions, Space, Typography } from 'antd'
import { InfinitySpin } from 'react-loader-spinner'

export const ViewUser = ({ user, closeModal }: { closeModal: () => void; user?: User }) => {
    return (
        <AppModal isModalOpen={!!user} closeModal={closeModal} title={`User "${user?.username}" Info`}>
            {user ? (
                <Space direction={'vertical'} style={{ width: '100%' }}>
                    <UserDescription user={user} />
                </Space>
            ) : (
                <InfinitySpin />
            )}
        </AppModal>
    )
}

function UserDescription({ user }: { user: User }) {
    return (
        <Descriptions bordered size='small' layout='vertical'>
            <Descriptions.Item label='Full name'>{user.fullName}</Descriptions.Item>
            <Descriptions.Item label='Role'>{user.role}</Descriptions.Item>
            <Descriptions.Item label='Username'>{user.username}</Descriptions.Item>
            <Descriptions.Item label='Email'>{user.email}</Descriptions.Item>
            {/*todo: add permissions to UserView
        <Descriptions.Item label='Permissions'>{user.}</Descriptions.Item>*/}
            <Descriptions.Item label='Phones'>
                {user.phones.map((phone, index) => (
                    <Typography key={'phone' + index}>
                        Phone #{index + 1}: {phone}
                    </Typography>
                ))}
            </Descriptions.Item>
        </Descriptions>
    )
}
