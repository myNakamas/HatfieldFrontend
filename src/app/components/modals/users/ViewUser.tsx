import React from 'react'
import { AppModal } from '../AppModal'
import { User } from '../../../models/interfaces/user'
import { Checkbox, Descriptions, Space, Typography } from 'antd'
import { InfinitySpin } from 'react-loader-spinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'

export const ViewUser = ({ user, closeModal }: { closeModal: () => void; user?: User }) => {
    return (
        <AppModal isModalOpen={!!user} closeModal={closeModal} title={`User "${user?.username}" Info`}>
            {user?.isBanned && (
                <Typography>
                    Banned user! <FontAwesomeIcon color='red' icon={faBan} />
                    The selected user has been banned fom the store.
                </Typography>
            )}
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

const UserDescription = ({ user }: { user: User }) => (
    <Descriptions bordered size='small' layout='vertical'>
        <Descriptions.Item label='Full name'>{user.fullName}</Descriptions.Item>
        <Descriptions.Item label='Role'>{user.role}</Descriptions.Item>
        <Descriptions.Item label='Username'>{user.username}</Descriptions.Item>
        <Descriptions.Item label='Email'>{user.email}</Descriptions.Item>
        <Descriptions.Item label='Shop'>{user.shopName}</Descriptions.Item>
        <Descriptions.Item label='Permissions'>
            Sms permission : <Checkbox checked={user.smsPermission} disabled /> <br />
            Email permission : <Checkbox checked={user.emailPermission} disabled />
        </Descriptions.Item>
        <Descriptions.Item label='Phones'>
            {user.phones.length > 0
                ? user.phones.map((phone, index) => (
                      <Typography key={'phone' + index}>
                          Phone #{index + 1}: {phone}
                      </Typography>
                  ))
                : '-'}
        </Descriptions.Item>
    </Descriptions>
)
