import React, { useContext, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { banClient, createClient, createWorkerUser, getAllUsers } from '../../axios/http/userRequests'
import { AddEditUser } from '../../components/modals/AddEditUser'
import { AuthContext } from '../../contexts/AuthContext'
import { User } from '../../models/interfaces/user'
import { SimpleUserSchema } from '../../models/validators/FormValidators'
import { toast } from 'react-toastify'
import { toastProps } from '../../components/modals/ToastProps'
import { getAllShops } from '../../axios/http/shopRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { ItemPropertyView, UserFilter } from '../../models/interfaces/generalModels'
import { UserRolesArray } from '../../models/enums/userEnums'
import { Shop } from '../../models/interfaces/shop'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'

export const Users = () => {
    const { loggedUser } = useContext(AuthContext)
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [filter, setFilter] = useState<UserFilter>({})

    const { data: users } = useQuery(['users', filter], () => getAllUsers({ filter }))
    const { data: shops } = useQuery('shops', getAllShops)
    const queryClient = useQueryClient()

    const onSubmit = (value: User) => {
        const user = loggedUser?.role === 'ADMIN' ? value : ({ ...value, shopId: loggedUser?.shopId } as User)
        const promise = user.role === 'CLIENT' ? createClient(user) : createWorkerUser(user)
        return toast
            .promise(
                promise,
                { pending: 'Sending', success: 'User successfully created', error: 'User creation failed' },
                toastProps
            )
            .then(() => {
                setSelectedUser(undefined)
                queryClient.invalidateQueries(['users']).then()
            })
    }
    const onEdit = (value: User) => {
        //not done yet
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
                <button className='actionButton' onClick={() => setSelectedUser({} as User)}>
                    Add a new user
                </button>
            </div>
            <div className='tableWrapper'>
                {users && users.length > 0 ? (
                    <CustomTable
                        data={users.map(({ userId, username, role, fullName, email, shopId }) => {
                            return {
                                username,
                                fullName,
                                role,
                                email,
                                shop: shops?.find(({ id }) => shopId === id)?.shopName,
                                actions: (
                                    <button className='iconButton' onClick={() => banClient(userId, true)}>
                                        <FontAwesomeIcon icon={faBan} />
                                    </button>
                                ),
                            }
                        })}
                    />
                ) : (
                    <NoDataComponent items='items in inventory' />
                )}
            </div>
        </div>
    )
}
