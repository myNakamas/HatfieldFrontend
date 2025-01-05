import { faPen, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, FloatButton, Input, Select, Space, Tabs, TabsProps, Tour } from 'antd'
import React, { useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { getAllShops, getWorkerShops } from '../../axios/http/shopRequests'
import { getAllUsers } from '../../axios/http/userRequests'
import { UserBanButton } from '../../components/UserBanButton'
import { AppSelect } from '../../components/form/AppSelect'
import { AddUser } from '../../components/modals/users/AddUser'
import { EditUser } from '../../components/modals/users/EditUser'
import { ViewUser } from '../../components/modals/users/ViewUser'
import { CustomTable } from '../../components/table/CustomTable'
import { defaultPage } from '../../models/enums/defaultValues'
import { UserRolesArray, userTourSteps } from '../../models/enums/userEnums'
import { UserFilter } from '../../models/interfaces/filters'
import { ItemPropertyView, Page, PageRequest } from '../../models/interfaces/generalModels'
import { User } from '../../models/interfaces/user'

export const Users = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const refsArray = Array.from({ length: 4 }, () => useRef(null))
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const [viewUser, setViewUser] = useState<User | undefined>()
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [filter, setFilter] = useState<UserFilter>({roles: [{ id: 1, value: 'ENGINEER' }, { id: 2, value: 'SALESMAN' }]})

    const { data: workers, isLoading } = useQuery(['users', filter, page], () => getAllUsers({ filter, page }))

    const tabs: TabsProps['items'] = [
        {
            key: '1',
            label: 'Workers',
            children: (
                <UsersTab
                    {...{
                        users: workers,
                        setSelectedUser,
                        setViewUser,
                        tourRef: refsArray[3],
                        isLoading,
                        page,
                        setPage,
                    }}
                />
            ),
        },
        {
            key: '2',
            label: 'Banned users',
            children: (
                <UsersTab
                    {...{
                        users: workers,
                        setSelectedUser,
                        setViewUser,
                        tourRef: refsArray[3],
                        isLoading,
                        page,
                        setPage,
                    }}
                />
            ),
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
                <Tabs
                    animated
                    defaultActiveKey='active'
                    onChange={(activeKey) => setFilter({ ...filter, banned: activeKey === '2' })}
                    items={tabs}
                />
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
    isLoading,
    page,
    setPage,
}: {
    users?: Page<User>
    setSelectedUser: (value: ((prevState: User | undefined) => User | undefined) | User | undefined) => void
    setViewUser: (value: ((prevState: User | undefined) => User | undefined) | User | undefined) => void
    tourRef: React.MutableRefObject<null>
    isLoading?: boolean
    page: PageRequest
    setPage: (page: PageRequest) => void
}) => {
    const { data: shops } = useQuery(['shops'], getAllShops)
    return (
        <CustomTable<User>
            loading={isLoading}
            headers={{
                username: 'Username',
                fullName: 'Full name',
                role: 'Role',
                email: 'Email',
                shop: 'Shop name',
                actions: 'Actions',
            }}
            data={
                users?.content.map((user) => {
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
                                <UserBanButton user={user} />
                            </Space>
                        ),
                    }
                }) ?? []
            }
            onClick={({ userId }) => setViewUser(users?.content.find((user) => user.userId === userId))}
            totalCount={users?.totalCount}
            pagination={page}
            onPageChange={setPage}
        />
    )
}

const UserFilters = ({
    filter,
    setFilter,
}: {
    filter: UserFilter
    setFilter: (value: ((prevState: UserFilter) => UserFilter) | UserFilter) => void
}) => {
    const { data: shops } = useQuery(['shops', 'short'], getWorkerShops)

    return (
        <div className='filterRow'>
            <AppSelect<number, ItemPropertyView>
                value={filter.shopId}
                options={shops ?? []}
                placeholder='Filter by shop'
                onChange={(value) => setFilter({ ...filter, shopId: value ?? undefined })}
                getOptionLabel={(shop) => shop.value}
                getOptionValue={(shop) => shop.id}
            />

            <Input
                value={filter.phone}
                onChange={(e) =>
                    setFilter({ ...filter, phone: !!e.currentTarget.value ? e.currentTarget.value : undefined })
                }
                placeholder={'Filter by phone'}
                type='search'
            />
            <Input
                value={filter.email}
                onChange={(e) => setFilter({ ...filter, email: e.currentTarget.value ?? undefined })}
                placeholder={'Filter by email'}
                type='search'
            />
            <Input
                value={filter.fullName}
                onChange={(e) => setFilter({ ...filter, fullName: e.currentTarget.value ?? undefined })}
                placeholder={'Filter by Full name'}
                type='search'
            />
                            <Select<ItemPropertyView[], ItemPropertyView>
                    style={{ minWidth: 200, maxWidth: 300, textAlign: 'left' }}
                    dropdownStyle={{ textAlign: 'left' }}
                    mode={'tags'}
                    allowClear
                    options={UserRolesArray}
                    value={filter.roles ? filter.roles : []}
                    placeholder='Filter by status'
                    onChange={(values, options) => setFilter({ ...filter, roles: options instanceof Array ? options : []})}
                    optionFilterProp={'value'}
                    optionLabelProp={'value'}
                />
        </div>
    )
}
