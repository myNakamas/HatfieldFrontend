import React, { useContext, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import {
    banClient,
    createClient,
    createWorkerUser,
    getAllClients,
    getAllUsers,
    getAllWorkers,
    updateClient,
    updateUser,
} from '../../axios/http/userRequests'
import { AddEditUser } from '../../components/modals/AddEditUser'
import { AuthContext } from '../../contexts/AuthContext'
import { User } from '../../models/interfaces/user'
import { EditUserSchema, SimpleUserSchema } from '../../models/validators/FormValidators'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
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
import { ViewUser } from '../../components/modals/ViewUser'
import { defaultUser } from '../../models/enums/defaultValues'

export const Users = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const tourRef1 = useRef(null)
    const tourRef2 = useRef(null)
    const tourRef3 = useRef(null)

    const { loggedUser } = useContext(AuthContext)
    const [viewUser, setViewUser] = useState<User | undefined>()
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [filter, setFilter] = useState<UserFilter>({})

    const { data: workers } = useQuery(['users', 'workers', { ...filter, banned: true }], () =>
        getAllWorkers({ filter: { ...filter, banned: false } })
    )
    const { data: clients } = useQuery(['users', 'clients', { ...filter, banned: true }], () =>
        getAllClients({ filter: { ...filter, banned: false } })
    )
    const { data: banned } = useQuery(['users', 'bannedUsers', { ...filter, banned: true }], () =>
        getAllUsers({ filter: { ...filter, banned: true } })
    )
    const queryClient = useQueryClient()

    const onSubmit = (formValue: User) => {
        if (formValue.userId !== undefined) return onEdit(formValue)
        else return onSaveNew(formValue)
    }

    const onSaveNew = (formValue: User) => {
        const user = loggedUser?.role === 'ADMIN' ? formValue : ({ ...formValue, shopId: loggedUser?.shopId } as User)
        return toast
            .promise(
                user.role === 'CLIENT' ? createClient(user) : createWorkerUser(user),
                { pending: 'Sending', success: 'User successfully created', error: 'User creation failed' },
                toastProps
            )
            .then(() => {
                setSelectedUser(undefined)
                queryClient.invalidateQueries(['users']).then()
            })
    }
    const onEdit = (value: User) => {
        return toast
            .promise(
                value.role === 'CLIENT' ? updateClient(value) : updateUser(value),
                toastUpdatePromiseTemplate('user'),
                toastProps
            )
            .then(() => {
                setSelectedUser(undefined)
                queryClient.invalidateQueries(['users']).then()
            })
    }

    const tabs: TabsProps['items'] = [
        {
            key: '1',
            label: 'Workers',
            children: <UsersTab {...{ users: workers, setSelectedUser, setViewUser, tourRef: tourRef3 }} showBan />,
        },
        {
            key: '2',
            label: 'Clients',
            children: <UsersTab {...{ users: clients, setSelectedUser, setViewUser, tourRef: tourRef3 }} showBan />,
        },
        {
            key: '3',
            label: 'Banned users',
            children: <UsersTab {...{ users: banned, setSelectedUser, setViewUser, tourRef: tourRef3 }} />,
        },
    ]

    return (
        <div className='mainScreen'>
            {/*todo:separate to Create modal and edit modal maybe*/}
            <AddEditUser
                isModalOpen={!!selectedUser}
                user={selectedUser}
                closeModal={() => setSelectedUser(undefined)}
                variation={loggedUser?.role === 'ADMIN' ? 'FULL' : 'CREATE'}
                onComplete={onSubmit}
                validateSchema={loggedUser?.role === 'ADMIN' ? EditUserSchema : SimpleUserSchema}
            />
            <ViewUser user={viewUser} closeModal={() => setViewUser(undefined)} />
            <UserFilters {...{ filter, setFilter }} />
            <div className='align-center button-bar'>
                <Button ref={tourRef1} onClick={() => setSelectedUser(defaultUser)}>
                    Add a new user
                </Button>
            </div>
            <div className='tableWrapper' ref={tourRef2}>
                <Tabs animated defaultActiveKey='active' items={tabs} />
            </div>
            <Tour
                type={'primary'}
                open={tourIsOpen}
                onClose={() => setTourIsOpen(false)}
                steps={userTourSteps([tourRef1, tourRef2, tourRef3])}
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
    const { data: shops } = useQuery('shops', getAllShops)
    const queryClient = useQueryClient()
    return users && users.length > 0 ? (
        <CustomTable<User>
            data={users.map((user) => {
                return {
                    userId: user.userId,
                    username: user.username,
                    fullName: user.fullName,
                    role: user.role,
                    email: user.email,
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
                                    description='Are you sure to ban this user?'
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
        <NoDataComponent items='items in inventory' />
    )
}

function UserFilters({
    filter,
    setFilter,
}: {
    filter: UserFilter
    setFilter: (value: ((prevState: UserFilter) => UserFilter) | UserFilter) => void
}) {
    const { data: shops } = useQuery('shops', getAllShops)

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
            {/*
                        <div className='filterField'>
                <Select<ItemPropertyView, true>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    options={UserRolesArray}
                    isMulti
                    placeholder='Filter by roles'
                    isClearable
                    onChange={(value: any) => {
                        setFilter({ ...filter, roles: value })
                    }}
                    getOptionLabel={({ value }) => value}
                    getOptionValue={({ id }) => String(id)}
                />
            </div>*/}
        </div>
    )
}
