import { CustomSuspense } from '../../../components/CustomSuspense'
import { CustomTable } from '../../../components/table/CustomTable'
import { NoDataComponent } from '../../../components/table/NoDataComponent'
import React, { useState } from 'react'
import { CreateTicket, Ticket } from '../../../models/interfaces/ticket'
import { useQuery, useQueryClient } from 'react-query'
import { ItemPropertyView, Page, PageRequest } from '../../../models/interfaces/generalModels'
import { createTicket, fetchAllTickets } from '../../../axios/http/ticketRequests'
import { AddTicket } from '../../../components/modals/ticket/AddTicket'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../../../components/modals/ToastProps'
import dateFormat from 'dateformat'
import { ViewTicket } from '../../../components/modals/ticket/ViewTicket'
import { Pagination } from '../../../components/table/Pagination'
import { TicketFilter } from '../../../models/interfaces/filters'
import { getAllBrands, getAllModels, getAllShops } from '../../../axios/http/shopRequests'
import { SearchComponent } from '../../../components/filters/SearchComponent'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { Shop } from '../../../models/interfaces/shop'
import { User } from '../../../models/interfaces/user'
import { getAllClients, getAllWorkers } from '../../../axios/http/userRequests'
import { DateTimeFilter } from '../../../components/filters/DateTimeFilter'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'

export const Tickets = () => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewModal, setShowNewModal] = useState(false)
    const [filter, setFilter] = useState({})
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 0 })

    const queryClient = useQueryClient()
    const active = useQuery(
        ['tickets', { ...filter, ticketStatuses: [] }, page],
        () => fetchAllTickets({ page, filter }),
        {
            onSuccess: (data) => {
                setSelectedTicket((ticket) => (ticket ? data.content?.find(({ id }) => ticket.id === id) : undefined))
            },
        }
    )
    const completed = useQuery(
        ['tickets', { ...filter, ticketStatuses: [] }, page],
        () => fetchAllTickets({ page, filter }),
        {
            onSuccess: (data) => {
                setSelectedTicket((ticket) => (ticket ? data.content?.find(({ id }) => ticket.id === id) : undefined))
            },
        }
    )
    const onSubmit = (formValue: CreateTicket) => {
        return toast
            .promise(createTicket({ ticket: formValue }), toastCreatePromiseTemplate('ticket'), toastProps)
            .then(() => {
                queryClient.invalidateQueries(['tickets']).then(() => setShowNewModal(false))
            })
    }

    return (
        <div className='mainScreen'>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewModal} closeModal={() => setShowNewModal(false)} onComplete={onSubmit} />
            <TicketFilters {...{ filter, setFilter }} />
            <div className=' button-bar'>
                <button className='actionButton' onClick={() => setShowNewModal(true)}>
                    Add Item
                </button>
            </div>

            {/*todo: display all currently-active tickets on top without pagination*/}
            <Tabs>
                <TabList>
                    <Tab>Active tickets</Tab>
                    <Tab>Completed tickets</Tab>
                </TabList>

                <TabPanel>
                    <TicketsTab {...{ ...active, setSelectedTicket, page, setPage }} />
                </TabPanel>
                <TabPanel>
                    <TicketsTab {...{ ...completed, setSelectedTicket, page, setPage }} />
                </TabPanel>
            </Tabs>
        </div>
    )
}

const TicketsTab = ({
    isSuccess,
    data,
    setSelectedTicket,
    page,
    setPage,
}: {
    isSuccess: boolean
    data?: Page<Ticket>
    setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => (
    <CustomSuspense isReady={isSuccess}>
        {data?.content && data.content.length > 0 ? (
            <>
                {/*todo: and display all non-active tickets in the following table with pagination*/}
                <div className='tableWrapper'>
                    <CustomTable<Ticket>
                        data={data.content.map(
                            ({ id, timestamp, deadline, createdBy, client, status, totalPrice }) => ({
                                id,
                                'creation date': dateFormat(timestamp),
                                deadline: deadline ? dateFormat(deadline) : '-',
                                status,
                                totalPrice,
                                createdBy: createdBy?.fullName,
                                client: client?.fullName,
                            })
                        )}
                        onClick={({ id }) =>
                            setSelectedTicket(data?.content.find(({ id: ticketId }) => id === ticketId))
                        }
                    />
                </div>
                <Pagination {...{ page, setPage }} pageCount={data.pageCount} />
            </>
        ) : (
            <NoDataComponent items='items in inventory' />
        )}
    </CustomSuspense>
)

const TicketFilters = ({
    filter,
    setFilter,
}: {
    filter: TicketFilter
    setFilter: (value: ((prevState: TicketFilter) => TicketFilter) | TicketFilter) => void
}) => {
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    // const { data: locations } = useQuery('locations', getAllLocations)
    //todo create get all clients and all users
    const { data: clients } = useQuery('clients', () => getAllClients({}))
    const { data: users } = useQuery('workers', () => getAllWorkers({}))
    const { data: shops } = useQuery('shops', getAllShops)

    return (
        <div className='ticketFilter'>
            <div className='filterColumn'>
                <h4>Filters</h4>
                <SearchComponent {...{ filter, setFilter }} />
                {/*                <Select<ItemPropertyView, true>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={filter.ticketStatuses?.map(
                        (status) => TicketStatusesArray.find(({ value }) => value === status) as ItemPropertyView
                    )}
                    options={TicketStatusesArray ?? []}
                    placeholder='Filter by status'
                    isMulti
                    isClearable
                    onChange={(value) =>
                        setFilter({ ...filter, ticketStatuses: value?.map((value) => value.value as TicketStatus) })
                    }
                    getOptionLabel={(status) => status.value}
                    getOptionValue={(status) => String(status.id)}
                />*/}
            </div>
            <div className='filterColumn' title={'Device filters'}>
                <h4>Device filters</h4>
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={models?.find(({ id }) => filter.modelId === id)}
                    options={models ?? []}
                    placeholder='Filter by model'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, modelId: value?.id ?? undefined })}
                    getOptionLabel={(model) => model.value}
                    getOptionValue={(model) => String(model.id)}
                />
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={brands?.find(({ id }) => filter.brandId === id)}
                    options={brands ?? []}
                    placeholder='Filter by brand'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, brandId: value?.id ?? undefined })}
                    getOptionLabel={(brand) => brand.value}
                    getOptionValue={(brand) => String(brand.id)}
                />
            </div>
            <div className='filterColumn' title={'Filter by users'}>
                <h4>Filter by users</h4>
                <Select<User, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={clients?.find(({ userId }) => filter.clientId === userId)}
                    options={clients ?? []}
                    placeholder='Filter by client'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, clientId: value?.userId ?? undefined })}
                    getOptionLabel={(client) => client.username}
                    getOptionValue={(client) => String(client.userId)}
                />
                <Select<User, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={users?.find(({ userId }) => filter.createdById === userId)}
                    options={users ?? []}
                    placeholder='Filter by ticket creator'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, createdById: value?.userId ?? undefined })}
                    getOptionLabel={(user) => user.username}
                    getOptionValue={(user) => String(user.userId)}
                />
                <Select<Shop, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={shops?.find(({ id }) => filter.modelId === id)}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, shopId: value?.id ?? undefined })}
                    getOptionLabel={(shop) => shop.shopName}
                    getOptionValue={(shop) => String(shop.id)}
                />
            </div>
            <div className='filterColumn' title={'Filter by date'}>
                <h4>Filter by date</h4>
                <DateTimeFilter
                    filter={filter}
                    setFilter={({ from, to }) => {
                        setFilter((oldVal) => ({
                            ...oldVal,
                            createdAfter: from?.slice(0, 10) ?? oldVal.createdAfter,
                            createdBefore: to?.slice(0, 10) ?? oldVal.createdBefore,
                        }))
                    }}
                    placeholder={'Created'}
                />
                <DateTimeFilter
                    filter={filter}
                    setFilter={({ from, to }) => {
                        setFilter((oldVal) => ({
                            ...oldVal,
                            deadlineAfter: from?.slice(0, 10) ?? oldVal.deadlineAfter,
                            deadlineBefore: to?.slice(0, 10) ?? oldVal.deadlineBefore,
                        }))
                    }}
                    placeholder={'Deadline'}
                />
            </div>
        </div>
    )
}
