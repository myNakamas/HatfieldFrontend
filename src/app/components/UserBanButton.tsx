import { User } from '../models/interfaces/user'
import { useQueryClient } from 'react-query'
import { Button, Popconfirm } from 'antd'
import { banClient } from '../axios/http/userRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faUndo } from '@fortawesome/free-solid-svg-icons'
import React from 'react'

export const UserBanButton = ({ user }: { user: User }) => {
    const queryClient = useQueryClient()
    return user.isBanned ? (
        <Popconfirm
            title='Unban user'
            description='Are you sure you wish to reactivate this account?'
            onConfirm={() => {
                banClient(user.userId, false).then(() => {
                    queryClient.invalidateQueries(['users']).then()
                })
            }}
        >
            <Button icon={<FontAwesomeIcon icon={faUndo} />} />
        </Popconfirm>
    ) : (
        <Popconfirm
            title='Ban user'
            description='Are you sure to ban this user?'
            onConfirm={() => {
                banClient(user.userId, true).then(() => {
                    queryClient.invalidateQueries(['users']).then()
                })
            }}
        >
            <Button icon={<FontAwesomeIcon icon={faBan} />} />
        </Popconfirm>
    )
}
