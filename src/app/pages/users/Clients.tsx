import React, { useContext, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { banClient, getAllClients } from '../../axios/http/userRequests'
import { User } from '../../models/interfaces/user'
import { getAllShops } from '../../axios/http/shopRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { UserFilter } from '../../models/interfaces/filters'
import { userTourSteps } from '../../models/enums/userEnums'
import { Button, FloatButton, Popconfirm, Space, Switch, Tour } from 'antd'
import { faPen, faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { ViewUser } from '../../components/modals/users/ViewUser'
import { FormField } from '../../components/form/Field'
import { AuthContext } from '../../contexts/AuthContext'
import { AddClient } from '../../components/modals/users/AddClient'
import { EditClient } from '../../components/modals/users/EditClient'

export const Clients = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const tourRef1 = useRef(null)
    const tourRef2 = useRef(null)
    const tourRef3 = useRef(null)
    const { loggedUser } = useContext(AuthContext)

    const [viewUser, setViewUser] = useState<User | undefined>()
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const { data: shops } = useQuery(['shops'], getAllShops)
    const [filter, setFilter] = useState<UserFilter>({
        banned: false,
        shop: shops?.find(({ id }) => loggedUser?.shopId === id),
    })
    const queryClient = useQueryClient()

    const { data: clients } = useQuery(['users', 'clients', filter], () => getAllClients({ filter }))

    return (
        <div className='mainScreen'>
            <AddClient isModalOpen={showCreateModal} closeModal={() => setShowCreateModal(false)} />
            <EditClient
                client={selectedUser}
                isModalOpen={!!selectedUser}
                closeModal={() => setSelectedUser(undefined)}
            />

            <ViewUser user={viewUser} closeModal={() => setViewUser(undefined)} />
            <ClientsFilters {...{ filter, setFilter }} />
            <Space className='align-center button-bar'>
                <Button
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    ref={tourRef1}
                    onClick={() => setShowCreateModal(true)}
                >
                    Add a new client
                </Button>
            </Space>
            <div className='tableWrapper' ref={tourRef2}>
                {clients && clients.length > 0 ? (
                    <CustomTable<User>
                        headers={{
                            username: 'username',
                            fullName: 'Full name',
                            role: 'role',
                            email: 'email',
                            shop: 'Shop name',
                            actions: 'Actions',
                        }}
                        data={clients.map((user) => {
                            return {
                                ...user,
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
                                            onConfirm={() => {
                                                banClient(user.userId, true).then(() => {
                                                    queryClient.invalidateQueries(['users', 'clients']).then()
                                                })
                                            }}
                                        >
                                            <Button icon={<FontAwesomeIcon icon={faBan} />} />
                                        </Popconfirm>
                                    </Space>
                                ),
                            }
                        })}
                        onClick={({ userId }) => setViewUser(clients?.find((user) => user.userId === userId))}
                    />
                ) : (
                    <NoDataComponent items='clients' />
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

const ClientsFilters = ({
    filter,
    setFilter,
}: {
    filter: UserFilter
    setFilter: (value: ((prevState: UserFilter) => UserFilter) | UserFilter) => void
}) => {
    return (
        <div className='filterRow'>
            <SearchComponent {...{ filter, setFilter }} />
            <FormField label='Banned clients filter'>
                <Switch checked={filter.banned} onChange={(value) => setFilter({ ...filter, banned: value })} />
            </FormField>
        </div>
    )
}
