import React, { useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { banClient, getAllUsers, getAllWorkers } from '../../axios/http/userRequests'
import { AddUser } from '../../components/modals/users/AddUser'
import { User } from '../../models/interfaces/user'
import { getAllShops } from '../../axios/http/shopRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { UserFilter } from '../../models/interfaces/filters'
import { userTourSteps } from '../../models/enums/userEnums'
import { Shop } from '../../models/interfaces/shop'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { Button, FloatButton, Popconfirm, Space, Tabs, TabsProps, Tour } from 'antd'
import { faPen, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { ViewUser } from '../../components/modals/users/ViewUser'
import { EditUser } from '../../components/modals/users/EditUser'

export const Users = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const refsArray = Array.from({ length: 4 }, () => useRef(null))

    const [viewUser, setViewUser] = useState<User | undefined>()
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [filter, setFilter] = useState<UserFilter>({})

    const { data: workers } = useQuery(['users', 'workers', { ...filter, banned: true }], () =>
        getAllWorkers({ filter: { ...filter, banned: false } })
    )
    const { data: banned } = useQuery(['users', 'bannedUsers', { ...filter, banned: true }], () =>
        getAllUsers({ filter: { ...filter, banned: true } })
    )

    const tabs: TabsProps['items'] = [
        {
            key: '1',
            label: 'Workers',
            children: <UsersTab {...{ users: workers, setSelectedUser, setViewUser, tourRef: refsArray[3] }} showBan />,
        },
        {
            key: '2',
            label: 'Banned users',
            children: <UsersTab {...{ users: banned, setSelectedUser, setViewUser, tourRef: refsArray[3] }} />,
        },
    ]

    return (
        <div className='mainScreen'>
            <AddUser isModalOpen={showCreateModal} closeModal={() => setShowCreateModal(false)} />
            <EditUser user={selectedUser} isModalOpen={!!selectedUser} closeModal={() => setSelectedUser(undefined)} />

            <ViewUser user={viewUser} closeModal={() => setViewUser(undefined)} />
            <UserFilters {...{ filter, setFilter }} />
            <Space className='align-center button-bar'>
                <Button ref={refsArray[1]} onClick={() => setShowCreateModal(true)}>
                    Add a new user
                </Button>
            </Space>
            <div ref={refsArray[2]}>
                <Tabs animated defaultActiveKey='active' items={tabs} />
            </div>
            <Tour
                type={'primary'}
                open={tourIsOpen}
                onClose={() => setTourIsOpen(false)}
                steps={userTourSteps(refsArray)}
            />
            <FloatButton
                tooltip={'Take a tour!'}
                onClick={() => setTourIsOpen(true)}
                icon={<FontAwesomeIcon icon={faQuestion} />}
            />
        </div>
    )
}

const UsersTab = ({
    users,
    setSelectedUser,
    setViewUser,
    tourRef,
    showBan,
}: {
    users?: User[]
    setSelectedUser: (value: ((prevState: User | undefined) => User | undefined) | User | undefined) => void
    setViewUser: (value: ((prevState: User | undefined) => User | undefined) | User | undefined) => void
    tourRef: React.MutableRefObject<null>
    showBan?: boolean
}) => {
    const { data: shops } = useQuery(['shops'], getAllShops)
    const queryClient = useQueryClient()
    return users && users.length > 0 ? (
        <CustomTable<User>
            headers={{
                username: 'Username',
                fullName: 'Full name',
                role: 'Role',
                email: 'Email',
                shop: 'Shop name',
                actions: 'Actions',
            }}
            data={users.map((user) => {
                return {
                    ...user,
                    shop: shops?.find(({ id }) => user.shopId === id)?.shopName,
                    actions: (
                        <Space>
                            <Button
                                ref={tourRef}
                                onClick={() => setSelectedUser(user)}
                                icon={<FontAwesomeIcon icon={faPen} />}
                            />
                            {showBan && (
                                <Popconfirm
                                    title='Ban user'
                                    description='Do you want to ban this user?'
                                    onConfirm={() => {
                                        banClient(user.userId, true).then(() => {
                                            queryClient.invalidateQueries(['users']).then()
                                        })
                                    }}
                                >
                                    <Button icon={<FontAwesomeIcon icon={faBan} />} />
                                </Popconfirm>
                            )}
                        </Space>
                    ),
                }
            })}
            onClick={({ userId }) => setViewUser(users?.find((user) => user.userId === userId))}
        />
    ) : (
        <NoDataComponent items='users' />
    )
}

const UserFilters = ({
    filter,
    setFilter,
}: {
    filter: UserFilter
    setFilter: (value: ((prevState: UserFilter) => UserFilter) | UserFilter) => void
}) => {
    const { data: shops } = useQuery(['shops'], getAllShops)

    return (
        <div className='filterRow'>
            <SearchComponent {...{ filter, setFilter }} />
            <div className='filterField'>
                <Select<Shop, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={filter.shop}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, shop: value ?? undefined })}
                    getOptionLabel={(shop) => shop.shopName}
                    getOptionValue={(shop) => String(shop.id)}
                />
            </div>
        </div>
    )
}
