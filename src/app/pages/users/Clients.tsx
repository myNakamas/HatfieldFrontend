import React, { useContext, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { banClient, getAllClientsPage } from '../../axios/http/userRequests'
import { User } from '../../models/interfaces/user'
import { getAllShops } from '../../axios/http/shopRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { UserFilter } from '../../models/interfaces/filters'
import { clientsTourSteps } from '../../models/enums/userEnums'
import { Button, FloatButton, Popconfirm, Space, Switch, Tour } from 'antd'
import { faPen, faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { ViewUser } from '../../components/modals/users/ViewUser'
import { FormField } from '../../components/form/Field'
import { AuthContext } from '../../contexts/AuthContext'
import { AddClient } from '../../components/modals/users/AddClient'
import { EditClient } from '../../components/modals/users/EditClient'
import { PageRequest } from '../../models/interfaces/generalModels'
import { defaultPage } from '../../models/enums/defaultValues'

const clientsTableHeaders = {
    username: 'username',
    fullName: 'Full name',
    role: 'role',
    email: 'email',
    actions: 'Actions',
}

export const Clients = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const refsArray = Array.from({ length: 4 }, () => useRef(null))
    const { isAdmin } = useContext(AuthContext)
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const [viewUser, setViewUser] = useState<User | undefined>()
    const [selectedUser, setSelectedUser] = useState<User | undefined>()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const { data: shops } = useQuery(['shops'], getAllShops, { enabled: isAdmin() })
    const [filter, setFilter] = useState<UserFilter>({
        banned: false,
    })
    const queryClient = useQueryClient()

    const { data: clients } = useQuery(['users', 'clients', page, filter], () => getAllClientsPage({ filter, page }))

    return (
        <div className='mainScreen' ref={refsArray[0]}>
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
                    ref={refsArray[1]}
                    onClick={() => setShowCreateModal(true)}
                >
                    Add a new client
                </Button>
            </Space>
            <div className='tableWrapper' ref={refsArray[2]}>
                {clients && clients.totalCount > 0 ? (
                    <CustomTable<User>
                        headers={
                            isAdmin()
                                ? { ...clientsTableHeaders, shop: 'Shop name' }
                                : clientsTableHeaders
                        }
                        data={clients.content.map((user) => {
                            return {
                                ...user,
                                shop: shops?.find(({ id }) => user.shopId === id)?.shopName,
                                actions: (
                                    <Space>
                                        <Button
                                            ref={refsArray[3]}
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
                        totalCount={clients.totalCount}
                        pagination={page}
                        onPageChange={setPage}
                        onClick={({ userId }) => setViewUser(clients?.content.find((user) => user.userId === userId))}
                    />
                ) : (
                    <NoDataComponent items='clients' />
                )}
            </div>
            <Tour
                type={'primary'}
                open={tourIsOpen}
                onClose={() => setTourIsOpen(false)}
                steps={clientsTourSteps(refsArray)}
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
