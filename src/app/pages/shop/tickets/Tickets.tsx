import { CustomSuspense } from '../../../components/CustomSuspense'
import { CustomTable } from '../../../components/table/CustomTable'
import { NoDataComponent } from '../../../components/table/NoDataComponent'
import React, { useContext, useEffect, useState } from 'react'
import { Ticket } from '../../../models/interfaces/ticket'
import { useQuery } from 'react-query'
import { ItemPropertyView, Page, PageRequest } from '../../../models/interfaces/generalModels'
import { fetchAllTickets, fetchClientTickets, fetchTicketById } from '../../../axios/http/ticketRequests'
import { AddTicket } from '../../../components/modals/ticket/AddTicket'
import dateFormat from 'dateformat'
import { TicketView } from '../../../components/modals/ticket/TicketView'
import { TicketFilter } from '../../../models/interfaces/filters'
import { getAllBrands, getAllModels, getAllShops } from '../../../axios/http/shopRequests'
import { SearchComponent } from '../../../components/filters/SearchComponent'
import { Shop } from '../../../models/interfaces/shop'
import { User } from '../../../models/interfaces/user'
import { getAllClients, getAllWorkers } from '../../../axios/http/userRequests'
import { DateTimeFilter } from '../../../components/filters/DateTimeFilter'
import { Button, Select, Space, Statistic, Tabs, TabsProps } from 'antd'
import {
    activeTicketStatuses,
    completedTicketStatuses,
    TicketStatus,
    TicketStatusesArray,
} from '../../../models/enums/ticketEnums'
import { useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { getUserString } from '../../../utils/helperFunctions'
import { defaultPage } from '../../../models/enums/defaultValues'
import { AuthContext } from '../../../contexts/AuthContext'
import { QrReaderButton } from '../../../components/modals/QrReaderModal'
import moment from 'moment/moment'
import { AddTicketInvoice } from '../../../components/modals/AddTicketInvoice'
import { AppSelect } from '../../../components/form/AppSelect'
import { FilterWrapper } from '../../../components/filters/FilterWrapper'

export const Tickets = () => {
    const { loggedUser, isClient, isWorker } = useContext(AuthContext)
    const [params] = useSearchParams()
    const [collectTicket, setCollectTicket] = useState<Ticket | undefined>()
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [ticketView, setTicketView] = useState('view')
    const [showNewModal, setShowNewModal] = useState(false)
    const [filter, setFilter] = useState<TicketFilter>({
        ticketStatuses: activeTicketStatuses,
        shopId: loggedUser?.shopId,
    })
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const onSelectedTicketUpdate = (data: Page<Ticket>) => {
        setSelectedTicket((ticket) => (ticket ? data.content?.find(({ id }) => ticket.id === id) : undefined))
    }
    const tickets = useQuery(
        ['tickets', filter, page],
        () => {
            const query = isClient() ? fetchClientTickets : fetchAllTickets
            return query({ page, filter })
        },
        {
            onSuccess: onSelectedTicketUpdate,
        }
    )

    useEffect(() => {
        params.get('ticketId') && fetchTicketById(Number(params.get('ticketId'))).then(setSelectedTicket)
    }, [])

    const tabs: TabsProps['items'] = [
        {
            key: '1',
            label: 'Active tickets',
            children: (
                <TicketsTab {...{ ...tickets, setSelectedTicket, page, setPage }} setCollectTicket={setCollectTicket} />
            ),
        },
        {
            key: '2',
            label: 'Completed tickets',
            children: (
                <TicketsTab {...{ ...tickets, setSelectedTicket, page, setPage }} setCollectTicket={setCollectTicket} />
            ),
        },
        {
            key: '3',
            label: 'All tickets',
            children: (
                <TicketsTab {...{ ...tickets, setSelectedTicket, page, setPage }} setCollectTicket={setCollectTicket} />
            ),
        },
    ]

    return (
        <div className='mainScreen'>
            <AddTicketInvoice
                ticket={collectTicket}
                closeModal={() => setCollectTicket(undefined)}
                isModalOpen={!!collectTicket}
            />
            <TicketView
                ticket={selectedTicket}
                closeModal={() => {
                    setSelectedTicket(undefined)
                    setTicketView('view')
                }}
                view={ticketView}
            />
            <AddTicket isModalOpen={showNewModal} closeModal={() => setShowNewModal(false)} />
            <Space className='buttonHeader' align={'start'}>
                <Space>
                    {isWorker() && (
                        <Button type={'primary'} onClick={() => setShowNewModal(true)}>
                            Add Ticket
                        </Button>
                    )}
                    <QrReaderButton title={'Scan QR code to open ticket'} />
                </Space>
                <Space wrap align={'start'}>
                    <TicketFilters {...{ filter, setFilter }} />
                </Space>
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
    setCollectTicket,
}: {
    isLoading: boolean
    data?: Page<Ticket>
    setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    setCollectTicket: (ticket: Ticket) => void
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => (
    <CustomSuspense isReady={!isLoading}>
        <div>
            {data && data.content.length > 0 ? (
                <CustomTable<Ticket>
                    data={data.content.map((ticket) => ({
                        ...ticket,
                        createdAt: dateFormat(ticket.timestamp),
                        timeLeft:
                            moment(ticket.deadline) > moment() ? (
                                <Statistic.Countdown
                                    title={dateFormat(ticket.deadline)}
                                    value={ticket.deadline.valueOf()}
                                />
                            ) : (
                                <Statistic title={dateFormat(ticket.deadline)} value={'Passed'} />
                            ),
                        device: `${ticket.deviceBrand ?? ''} ${ticket.deviceModel ?? ''}`,
                        createdByName: ticket.createdBy?.fullName,
                        price: !ticket.totalPrice
                            ? 'NEED TO QUOTE'
                            : ticket.totalPrice === ticket.deposit
                            ? 'PAID'
                            : `£ ${ticket.totalPrice - ticket.deposit}`,
                        clientName: ticket.client ? getUserString(ticket.client) : '-',
                        actions: (
                            <Space>
                                <Button
                                    icon={<FontAwesomeIcon icon={faPen} />}
                                    onClick={() => setSelectedTicket(ticket)}
                                />
                                <Button onClick={() => setCollectTicket(ticket)}>Collect</Button>
                            </Space>
                        ),
                    }))}
                    headers={{
                        id: 'Id',
                        timeLeft: 'Time left timer',
                        device: 'Device Brand&Model',
                        status: 'Ticket Status',
                        deviceLocation: 'Device Location',
                        price: 'Price',
                        clientName: 'Client',
                        actions: 'Actions',
                    }}
                    onClick={({ id }) => {
                        const ticket = data.content.find((ticket) => ticket.id === id)
                        setSelectedTicket(ticket)
                    }}
                    pagination={page}
                    onPageChange={setPage}
                    totalCount={data.totalCount}
                />
            ) : (
                <NoDataComponent items='tickets' />
            )}
        </div>
    </CustomSuspense>
)

const TicketFilters = ({
    filter,
    setFilter,
}: {
    filter: TicketFilter
    setFilter: (value: ((prevState: TicketFilter) => TicketFilter) | TicketFilter) => void
}) => {
    const { isWorker, isAdmin } = useContext(AuthContext)
    const [advanced, setAdvanced] = useState(false)
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const { data: users } = useQuery(['users', 'workers'], () => getAllWorkers({}), {
        enabled: isAdmin(),
    })
    const { data: shops } = useQuery('shops', getAllShops, { enabled: isAdmin() })
    return advanced ? (
        <Space className='largeFilter' wrap align={'start'}>
            <FilterWrapper title={'General filters'}>
                <SearchComponent {...{ filter, setFilter }} />
                <Select<TicketStatus[], ItemPropertyView>
                    mode={'tags'}
                    allowClear
                    options={TicketStatusesArray}
                    value={filter.ticketStatuses}
                    placeholder='Filter by status'
                    onChange={(values) => setFilter({ ...filter, ticketStatuses: values })}
                    optionFilterProp={'value'}
                    optionLabelProp={'value'}
                />
            </FilterWrapper>
            <FilterWrapper title={'Device filters'}>
                <AppSelect<number, ItemPropertyView>
                    value={filter.brandId}
                    options={brands}
                    placeholder='Filter by brand'
                    onChange={(id) => setFilter({ ...filter, brandId: id ?? undefined })}
                    getOptionLabel={(brand) => brand.value}
                    getOptionValue={(brand) => brand.id}
                />
                <AppSelect<number, ItemPropertyView>
                    value={filter.modelId}
                    options={models}
                    placeholder='Filter by model'
                    onChange={(id) => setFilter({ ...filter, modelId: id ?? undefined })}
                    getOptionLabel={(model) => model.value}
                    getOptionValue={(model) => model.id}
                />
            </FilterWrapper>
            <FilterWrapper title={'Filter by users'}>
                <AppSelect<string, User>
                    value={filter.clientId}
                    options={clients}
                    placeholder='Filter by client'
                    onChange={(id) => setFilter({ ...filter, clientId: id ?? undefined })}
                    getOptionLabel={(user) => user.username}
                    getOptionValue={(user) => user.userId}
                />
                <AppSelect<string, User>
                    value={filter.createdById}
                    options={users}
                    placeholder='Filter by ticket creator'
                    onChange={(id) => setFilter({ ...filter, createdById: id ?? undefined })}
                    getOptionLabel={(user) => user.username}
                    getOptionValue={(user) => user.userId}
                />
                {isAdmin() && (
                    <AppSelect<number, Shop>
                        value={filter.shopId}
                        options={shops}
                        placeholder='Filter by shop'
                        onChange={(id) => setFilter({ ...filter, shopId: id ?? undefined })}
                        getOptionLabel={(shop) => shop.shopName}
                        getOptionValue={(shop) => shop.id}
                    />
                )}
            </FilterWrapper>
            <FilterWrapper title={'Filter by date'}>
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
            </FilterWrapper>
        </Space>
    ) : (
        <Space wrap>
            <SearchComponent {...{ filter, setFilter }} />
            <Button type={'link'} onClick={() => setAdvanced(true)} children={'Advanced search'} />
        </Space>
    )
}
