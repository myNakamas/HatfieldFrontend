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
import { Button, Tabs, TabsProps } from 'antd'
import {
    activeTicketStatuses,
    completedTicketStatuses,
    TicketStatus,
    TicketStatusesArray,
} from '../../../models/enums/ticketEnums'
import { useSearchParams } from 'react-router-dom'

export const Tickets = () => {
    const [params] = useSearchParams()
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewModal, setShowNewModal] = useState(false)
    const [filter, setFilter] = useState<TicketFilter>({ ticketStatuses: activeTicketStatuses })

    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
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
            children: <TicketsTab {...{ ...tickets, setSelectedTicket, page, setPage }} />,
        },
        {
            key: '2',
            label: 'Completed tickets',
            children: <TicketsTab {...{ ...tickets, setSelectedTicket, page, setPage }} />,
        },
        {
            key: '3',
            label: 'All tickets',
            children: <TicketsTab {...{ ...tickets, setSelectedTicket, page, setPage }} />,
        },
    ]

    return (
        <div className='mainScreen'>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewModal} closeModal={() => setShowNewModal(false)} />
            <TicketFilters {...{ filter, setFilter }} />
            <div className=' button-bar'>
                <Button type={'primary'} onClick={() => setShowNewModal(true)}>
                    Add Ticket
                </Button>
            </div>
            <Tabs
                animated
                defaultActiveKey='active'
                items={tabs}
                onChange={(key) => {
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
}: {
    isLoading: boolean
    data?: Page<Ticket>
    setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => (
    <CustomSuspense isReady={!isLoading}>
        {data && data.content.length > 0 ? (
            <CustomTable<Ticket>
                data={data.content.map(({ timestamp, deadline, createdBy, client, ...rest }) => ({
                    ...rest,
                    timestamp: dateFormat(timestamp),
                    deadline: deadline ? dateFormat(deadline) : '-',
                    createdBy: createdBy?.fullName,
                    client: client?.fullName,
                }))}
                headers={{
                    id: 'Ticket Id',
                    timestamp: 'Creation date',
                    deadline: 'Deadline',
                    status: 'Ticket status',
                    totalPrice: 'Total Price',
                    createdBy: 'Created by',
                    client: 'Client name',
                }}
                onClick={({ id }) => setSelectedTicket(data?.content.find(({ id: ticketId }) => id === ticketId))}
                pagination={page}
                onPageChange={setPage}
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
    // const { data: locations } = useQuery('locations', getAllLocations)
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
                    getOptionLabel={(client) => client.username}
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
                    getOptionLabel={(user) => user.username}
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
    ) : (
        <div className='flex'>
            <SearchComponent {...{ filter, setFilter }} />
            <Button type={'link'} onClick={() => setAdvanced(true)}>
                Advanced search
            </Button>
        </div>
    )
}
