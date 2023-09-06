import React, { useContext, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { getAllClientsPage } from '../../axios/http/userRequests'
import { User } from '../../models/interfaces/user'
import { getAllShops, getWorkerShops } from '../../axios/http/shopRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { UserFilter } from '../../models/interfaces/filters'
import { clientsTourSteps } from '../../models/enums/userEnums'
import { Button, FloatButton, Input, Space, Tour } from 'antd'
import { faPen, faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { ViewUser } from '../../components/modals/users/ViewUser'
import { AuthContext } from '../../contexts/AuthContext'
import { AddClient } from '../../components/modals/users/AddClient'
import { EditClient } from '../../components/modals/users/EditClient'
import { ItemPropertyView, PageRequest } from '../../models/interfaces/generalModels'
import { defaultPage } from '../../models/enums/defaultValues'
import { UserBanButton } from '../../components/UserBanButton'
import { AppSelect } from '../../components/form/AppSelect'
import CheckableTag from 'antd/es/tag/CheckableTag'
import { resetPageIfNoValues } from '../../utils/helperFunctions'

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

    const { data: clients } = useQuery(['users', 'clients', page, filter], () => getAllClientsPage({ filter, page }), {
        onSuccess: (data) => resetPageIfNoValues(data, setPage),
    })

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
            <div ref={refsArray[2]}>
                {clients && clients.totalCount > 0 ? (
                    <CustomTable<User>
                        headers={isAdmin() ? { ...clientsTableHeaders, shop: 'Shop name' } : clientsTableHeaders}
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
                                        <UserBanButton user={user} />
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
    const { isAdmin } = useContext(AuthContext)
    const { data: shops } = useQuery(['shops', 'short'], getWorkerShops, { enabled: isAdmin() })
    return (
        <div className='filterRow'>
            <SearchComponent {...{ filter, setFilter }} />
            {isAdmin() && (
                <AppSelect<number, ItemPropertyView>
                    value={filter.shopId}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    onChange={(value) => setFilter({ ...filter, shopId: value ?? undefined })}
                    getOptionLabel={(shop) => shop.value}
                    getOptionValue={(shop) => shop.id}
                />
            )}
            <Input
                value={filter.phone}
                onChange={(e) => setFilter({ ...filter, phone: e.currentTarget.value })}
                placeholder={'Filter by exact phone'}
            />
            <Space>
                <CheckableTag
                    checked={filter.banned ?? false}
                    onChange={(value) => setFilter({ ...filter, banned: value })}
                >
                    Show banned clients
                </CheckableTag>
            </Space>
        </div>
    )
}
