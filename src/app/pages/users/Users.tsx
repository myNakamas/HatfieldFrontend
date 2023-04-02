import React, { useContext, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import {
    banClient,
    createClient,
    createWorkerUser,
    getAllUsers,
    updateClient,
    updateUser,
} from '../../axios/http/userRequests'
import { AddEditUser } from '../../components/modals/AddEditUser'
import { AuthContext } from '../../contexts/AuthContext'
import { User } from '../../models/interfaces/user'
import { SimpleUserSchema } from '../../models/validators/FormValidators'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { getAllShops } from '../../axios/http/shopRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { UserFilter } from '../../models/interfaces/filters'
import { UserRolesArray, userTourSteps } from '../../models/enums/userEnums'
import { Shop } from '../../models/interfaces/shop'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { Button, FloatButton, Popconfirm, Space, Tour } from 'antd'
import { faPen, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { ViewUser } from '../../components/modals/ViewUser'

export const Users = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const tourRef1 = useRef(null)
    const tourRef2 = useRef(null)
    const tourRef3 = useRef(null)

    const { loggedUser } = useContext(AuthContext)
    const [viewUser, setViewUser] = useState<User | undefined>()
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [filter, setFilter] = useState<UserFilter>({})

    const { data: users } = useQuery(['users', filter], () => getAllUsers({ filter }))
    const { data: shops } = useQuery('shops', getAllShops)
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

    return (
        <div className='mainScreen'>
            <AddEditUser
                isModalOpen={!!selectedUser}
                user={selectedUser}
                closeModal={() => setSelectedUser(undefined)}
                variation={loggedUser?.role === 'ADMIN' ? 'FULL' : 'CREATE'}
                onComplete={onSubmit}
                validateSchema={SimpleUserSchema}
            />
            <ViewUser user={viewUser} closeModal={() => setViewUser(undefined)} />
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
                </div>
            </div>
            <div className='align-center button-bar'>
                <Button ref={tourRef1} onClick={() => setSelectedUser({} as User)}>
                    Add a new user
                </Button>
            </div>
            <div className='tableWrapper' ref={tourRef2}>
                {users && users.length > 0 ? (
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
                                            ref={tourRef3}
                                            onClick={() => setSelectedUser(user)}
                                            icon={<FontAwesomeIcon icon={faPen} />}
                                        />

                                        <Popconfirm
                                            title='Ban user'
                                            description='Are you sure to ban this user?'
                                            onConfirm={() => banClient(user.userId, true)}
                                        >
                                            <Button icon={<FontAwesomeIcon icon={faBan} />} />
                                        </Popconfirm>
                                    </Space>
                                ),
                            }
                        })}
                        onClick={({ userId }) => setViewUser(users?.find((user) => user.userId === userId))}
                    />
                ) : (
                    <NoDataComponent items='items in inventory' />
                )}
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
