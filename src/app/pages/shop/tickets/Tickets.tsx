import { CustomSuspense } from '../../../components/CustomSuspense'
import { CustomTable } from '../../../components/table/CustomTable'
import { NoDataComponent } from '../../../components/table/NoDataComponent'
import React, { useEffect, useState } from 'react'
import { Ticket } from '../../../models/interfaces/ticket'
import { useQuery } from 'react-query'
import { ItemPropertyView, Page, PageRequest } from '../../../models/interfaces/generalModels'
import { fetchAllTickets, fetchTicketById } from '../../../axios/http/ticketRequests'
import { AddTicket } from '../../../components/modals/ticket/AddTicket'
import dateFormat from 'dateformat'
import { ViewTicket } from '../../../components/modals/ticket/ViewTicket'
import { TicketFilter } from '../../../models/interfaces/filters'
import { getAllBrands, getAllModels, getAllShops } from '../../../axios/http/shopRequests'
import { SearchComponent } from '../../../components/filters/SearchComponent'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { Shop } from '../../../models/interfaces/shop'
import { User } from '../../../models/interfaces/user'
import { getAllClients, getAllWorkers } from '../../../axios/http/userRequests'
import { DateTimeFilter } from '../../../components/filters/DateTimeFilter'
import { Button, Space, Tabs, TabsProps } from 'antd'
import {
    activeTicketStatuses,
    completedTicketStatuses,
    TicketStatus,
    TicketStatusesArray,
} from '../../../models/enums/ticketEnums'
import { useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen'
import { getUserString } from '../../../utils/helperFunctions'
import { defaultPage } from '../../../models/enums/defaultValues'

export const Tickets = () => {
    const [params] = useSearchParams()
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [ticketView, setTicketView] = useState('view')
    const [showNewModal, setShowNewModal] = useState(false)
    const [filter, setFilter] = useState<TicketFilter>({})
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const onSelectedTicketUpdate = (data: Page<Ticket>) => {
        setSelectedTicket((ticket) => (ticket ? data.content?.find(({ id }) => ticket.id === id) : undefined))
    }
    const tickets = useQuery(['tickets', filter, page], () => fetchAllTickets({ page, filter }), {
        onSuccess: onSelectedTicketUpdate,
    })
    useEffect(() => {
        params.get('ticketId') && fetchTicketById(Number(params.get('ticketId'))).then(setSelectedTicket)
    }, [])

    const tabs: TabsProps['items'] = [
        {
            key: '1',
            label: 'Active tickets',
            children: (
                <TicketsTab
                    {...{ ...tickets, setSelectedTicket, page, setPage }}
                    setEditTicket={(ticket) => {
                        setSelectedTicket(ticket)
                        setTicketView('edit')
                    }}
                />
            ),
        },
        {
            key: '2',
            label: 'Completed tickets',
            children: (
                <TicketsTab
                    {...{ ...tickets, setSelectedTicket, page, setPage }}
                    setEditTicket={(ticket) => {
                        setSelectedTicket(ticket)
                        setTicketView('edit')
                    }}
                />
            ),
        },
        {
            key: '3',
            label: 'All tickets',
            children: (
                <TicketsTab
                    {...{ ...tickets, setSelectedTicket, page, setPage }}
                    setEditTicket={(ticket) => {
                        setSelectedTicket(ticket)
                        setTicketView('edit')
                    }}
                />
            ),
        },
    ]

    return (
        <div className='mainScreen'>
            <ViewTicket
                ticket={selectedTicket}
                closeModal={() => {
                    setSelectedTicket(undefined)
                    setTicketView('view')
                }}
                view={ticketView}
            />
            <AddTicket isModalOpen={showNewModal} closeModal={() => setShowNewModal(false)} />
            <TicketFilters {...{ filter, setFilter }} />
            <Space className='button-bar'>
                <Button type={'primary'} onClick={() => setShowNewModal(true)}>
                    Add Ticket
                </Button>
            </Space>
            <Tabs
                animated
                defaultActiveKey='active'
                items={tabs}
                onChange={(key) => {
                    setPage({ pageSize: page.pageSize, page: 1 })
                    setFilter((old) => ({
                        ...old,
                        ticketStatuses: key === '1' ? activeTicketStatuses : key === '2' ? completedTicketStatuses : [],
                    }))
                }}
            />
        </div>
    )
}

const TicketsTab = ({
    isLoading,
    data,
    setSelectedTicket,
    page,
    setPage,
    setEditTicket,
}: {
    isLoading: boolean
    data?: Page<Ticket>
    setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    setEditTicket: (ticket: Ticket) => void
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => (
    <CustomSuspense isReady={!isLoading}>
        {data && data.content.length > 0 ? (
            <CustomTable<Ticket>
                data={data.content.map((ticket) => ({
                    ...ticket,
                    timestamp: dateFormat(ticket.timestamp),
                    deadline: ticket.deadline ? dateFormat(ticket.deadline) : '-',
                    createdByName: ticket.createdBy?.fullName,
                    clientName: ticket.client?.fullName,
                    actions: <Button icon={<FontAwesomeIcon icon={faPen} />} onClick={() => setEditTicket(ticket)} />,
                }))}
                headers={{
                    id: 'Ticket Id',
                    timestamp: 'Creation date',
                    deadline: 'Deadline',
                    status: 'Ticket status',
                    totalPrice: 'Total Price',
                    createdByName: 'Created by',
                    clientName: 'Client name',
                    actions: 'Actions',
                }}
                onClick={(ticket) => setSelectedTicket(ticket)}
                pagination={page}
                onPageChange={setPage}
                totalCount={data.totalCount}
            />
        ) : (
            <NoDataComponent items='tickets' />
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
    const [advanced, setAdvanced] = useState(false)
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}))
    const { data: users } = useQuery(['users', 'workers'], () => getAllWorkers({}))
    const { data: shops } = useQuery(['shops'], getAllShops)
    return advanced ? (
        <div className='largeFilter'>
            <div className='filterColumn'>
                <h4>Filters</h4>
                <SearchComponent {...{ filter, setFilter }} />
                <Select<ItemPropertyView, true>
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
                />
            </div>
            <div className='filterColumn' title={'Device filters'}>
                <h4>Device filters</h4>
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={models?.find(({ id }) => filter.modelId === id) ?? null}
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
                    value={brands?.find(({ id }) => filter.brandId === id) ?? null}
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
                    value={clients?.find(({ userId }) => filter.clientId === userId) ?? null}
                    options={clients ?? []}
                    placeholder='Filter by client'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, clientId: value?.userId ?? undefined })}
                    getOptionLabel={getUserString}
                    getOptionValue={(client) => String(client.userId)}
                />
                <Select<User, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={users?.find(({ userId }) => filter.createdById === userId) ?? null}
                    options={users ?? []}
                    placeholder='Filter by ticket creator'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, createdById: value?.userId ?? undefined })}
                    getOptionLabel={getUserString}
                    getOptionValue={(user) => String(user.userId)}
                />
                <Select<Shop, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={shops?.find(({ id }) => filter.shopId === id) ?? null}
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
                            createdAfter: from?.slice(0, 10) ?? undefined,
                            createdBefore: to?.slice(0, 10) ?? undefined,
                        }))
                    }}
                    placeholder={'Created'}
                />
                <DateTimeFilter
                    filter={filter}
                    setFilter={({ from, to }) => {
                        setFilter((oldVal) => ({
                            ...oldVal,
                            deadlineAfter: from?.slice(0, 10) ?? undefined,
                            deadlineBefore: to?.slice(0, 10) ?? undefined,
                        }))
                    }}
                    placeholder={'Deadline'}
                />
            </div>
        </div>
    ) : (
        <div className='flex'>
            <SearchComponent {...{ filter, setFilter }} />
            <Button type={'link'} onClick={() => setAdvanced(true)}>
                Advanced search
            </Button>
        </div>
    )
}
