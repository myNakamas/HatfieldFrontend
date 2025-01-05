import { faCheck, faList, faPen, faTable } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Card, Input, Pagination, Segmented, Select, Space, Tabs, TabsProps, Tag } from 'antd'
import Paragraph from 'antd/es/typography/Paragraph'
import dateFormat from 'dateformat'

import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { getAllBrands, getAllModels, getAllShops } from '../../../axios/http/shopRequests'
import { fetchAllTickets, fetchClientTickets } from '../../../axios/http/ticketRequests'
import { getAllClients, getAllWorkers } from '../../../axios/http/userRequests'
import { CustomSuspense } from '../../../components/CustomSuspense'
import { AdvancedSearchButton } from '../../../components/filters/AdvancedSearchButton'
import { DateTimeFilter } from '../../../components/filters/DateTimeFilter'
import { FilterWrapper } from '../../../components/filters/FilterWrapper'
import { SearchComponent } from '../../../components/filters/SearchComponent'
import { AppSelect } from '../../../components/form/AppSelect'
import { AddTicketInvoice } from '../../../components/modals/AddTicketInvoice'
import { QrReaderButton } from '../../../components/modals/QrReaderModal'
import { AddTicket } from '../../../components/modals/ticket/AddTicket'
import { TicketView } from '../../../components/modals/ticket/TicketView'
import { CustomTable, getPagination } from '../../../components/table/CustomTable'
import { NoDataComponent } from '../../../components/table/NoDataComponent'
import { AuthContext } from '../../../contexts/AuthContext'
import { defaultPage, setDefaultPageSize } from '../../../models/enums/defaultValues'
import {
    activeTicketStatuses,
    collectedTicketStatuses,
    completedTicketStatuses,
    getTicketStatusColor,
    TicketStatus,
    ticketStatusCategory,
    TicketStatusesArray,
} from '../../../models/enums/ticketEnums'
import { TicketFilter } from '../../../models/interfaces/filters'
import { ItemPropertyView, Page, PageRequest } from '../../../models/interfaces/generalModels'
import { Shop } from '../../../models/interfaces/shop'
import { Ticket } from '../../../models/interfaces/ticket'
import { User } from '../../../models/interfaces/user'
import { currencyFormat, getUserString, resetPageIfNoValues } from '../../../utils/helperFunctions'

export const Tickets = () => {
    const queryClient = useQueryClient()
    const { loggedUser, isClient, isWorker } = useContext(AuthContext)
    const [collectTicket, setCollectTicket] = useState<Ticket | undefined>()
    const [selectedTicketId, setSelectedTicketId] = useState<number | undefined>()
    const [listView, setListView] = useState(window.innerWidth > 1000 ? 'table' : 'list')
    const [ticketView, setTicketView] = useState('view')
    const [showNewModal, setShowNewModal] = useState(false)
    const [filter, setFilter] = useState<TicketFilter>({
        ticketStatuses: activeTicketStatuses,
        shopId: loggedUser?.shopId,
    })
    const [page, setPage] = useState<PageRequest>(defaultPage)

    const tickets = useQuery(
        ['tickets', filter, page],
        () => {
            const query = isClient() ? fetchClientTickets : fetchAllTickets
            return query({ page, filter })
        },
        {
            onSuccess: (data) => {
                resetPageIfNoValues(data, setPage)
            },
        }
    )
    const setEditTicketId = (ticketId?: number) => {
        setTicketView('edit')
        setSelectedTicketId(ticketId)
    }
    const openTab = {
        ...tickets,
        setSelectedTicketId,
        setEditTicketId,
        page,
        setPage,
        view: listView,
        setCollectTicket,
    }
    const tabs: TabsProps['items'] = [
        {
            key: '1',
            label: 'Active tickets',
            children: <TicketsTab {...openTab} />,
        },
        {
            key: '2',
            label: 'Waiting tickets',
            children: <TicketsTab {...openTab} />,
        },
        {
            key: '3',
            label: 'Completed tickets',
            children: <TicketsTab {...openTab} />,
        },
        {
            key: '4',
            label: 'Collected tickets',
            children: <TicketsTab {...openTab} />,
        },
        {
            key: '5',
            label: 'All tickets',
            children: <TicketsTab {...openTab} />,
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
                open={!!selectedTicketId}
                ticketId={selectedTicketId}
                closeModal={() => {
                    setSelectedTicketId(undefined)
                    setTicketView('view')
                    queryClient.invalidateQueries(['tickets'])
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
                destroyInactiveTabPane
                items={tabs}
                tabBarExtraContent={
                    window.innerWidth > 400 &&
                    window.innerWidth < 1200 && (
                        <Segmented
                            value={listView}
                            options={[
                                { value: 'table', icon: <FontAwesomeIcon icon={faTable} /> },
                                { value: 'list', icon: <FontAwesomeIcon icon={faList} /> },
                            ]}
                            onChange={setListView}
                        />
                    )
                }
                onChange={(key) => {
                    setPage({ pageSize: page.pageSize, page: 1 })
                    setFilter((old) => ({
                        ...old,
                        ticketStatuses: ticketStatusCategory[key] ?? [],
                    }))
                }}
            />
        </div>
    )
}

const TicketsTab = ({
    isLoading,
    data,
    setSelectedTicketId,
    setEditTicketId,
    page,
    setPage,
    setCollectTicket,
    view,
}: {
    isLoading: boolean
    data?: Page<Ticket>
    setSelectedTicketId: React.Dispatch<React.SetStateAction<number | undefined>>
    setEditTicketId: (ticketId: number | undefined) => void
    setCollectTicket: (ticket: Ticket) => void
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
    view: string
}) => {
    return (
        <CustomSuspense isReady={!isLoading}>
            <div>
                {data && data.content.length > 0 ? (
                    <Space direction='vertical' className='w-100'>
                        {(data.content.length > 10 || view === 'list') && (
                            <Pagination
                                hideOnSinglePage
                                {...getPagination(page, data.totalCount)}
                                onChange={(page, pageSize) => setPage({ page, pageSize })}
                            ></Pagination>
                        )}
                        {view === 'table' ? (
                            <TicketTable
                                {...{
                                    data,
                                    setSelectedTicketId,
                                    setEditTicketId,
                                    setCollectTicket,
                                }}
                            />
                        ) : (
                            <>
                                {data.content.map((ticket) => (
                                    <TicketListItem
                                        key={'ticketListItem#' + ticket.id}
                                        {...{ ticket, setSelectedTicketId, setEditTicketId, setCollectTicket }}
                                    />
                                ))}
                            </>
                        )}
                        <Pagination
                            {...getPagination(page, data.totalCount)}
                            onShowSizeChange={(page, pageSize) => {
                                setPage({ page, pageSize })
                                pageSize && setDefaultPageSize(pageSize)
                            }
                        }
                            onChange={(page, pageSize) => {
                                setPage({ page, pageSize })
                                pageSize && setDefaultPageSize(pageSize)
                            }}
                        ></Pagination>
                    </Space>
                ) : (
                    <NoDataComponent items='tickets' />
                )}
            </div>
        </CustomSuspense>
    )
}

const TicketTable = ({
    data,
    setEditTicketId,
    setSelectedTicketId,
    setCollectTicket,
}: {
    data: Page<Ticket>
    setSelectedTicketId: React.Dispatch<React.SetStateAction<number | undefined>>
    setEditTicketId: (ticketId: number | undefined) => void
    setCollectTicket: (ticket: Ticket) => void
}) => {
    return (
        <CustomTable<Ticket>
            data={data.content.map((ticket) => {
                const deadline = moment(ticket.deadline)
                return {
                    ...ticket,
                    status: <Tag color={getTicketStatusColor(ticket.status)}>{ticket.status}</Tag>,
                    createdAt: dateFormat(ticket.timestamp),
                    timeLeft: completedTicketStatuses.includes(ticket.status) ? (
                        <Tag color='green'>{dateFormat(ticket.deadline)}</Tag>
                    ) : deadline > moment() ? (
                        <Countdown {...{ deadline }} />
                    ) : (
                        <Tag color='red'>{deadline.fromNow()}</Tag>
                    ),
                    description: (
                        <Paragraph
                            ellipsis={{
                                rows: 2,
                            }}
                        >
                            {ticket.problemExplanation}
                        </Paragraph>
                    ),
                    device: `${ticket.deviceBrand ?? ''} ${ticket.deviceModel ?? ''}`,
                    createdByName: ticket.createdBy?.fullName,
                    price: !ticket.totalPrice
                        ? 'NEED TO QUOTE'
                        : ticket.totalPrice === ticket.deposit
                        ? 'PAID'
                        : currencyFormat(+ticket.totalPrice - +ticket.deposit),
                    clientName: ticket.client ? getUserString(ticket.client) : '-',
                    actions: (
                        <Space wrap>
                            <Button
                                icon={<FontAwesomeIcon icon={faPen} />}
                                onClick={() => setEditTicketId(ticket.id)}
                            />
                            <Button onClick={() => setCollectTicket(ticket)}>Collect</Button>
                        </Space>
                    ),
                }
            })}
            headers={{
                id: 'Id',
                createdAt: 'Creation Date',
                timeLeft: 'Time left timer',
                description: 'Description',
                device: 'Device Brand&Model',
                status: 'Ticket Status',
                deviceLocation: 'Device Location',
                price: 'Price',
                clientName: 'Client',
                actions: 'Actions',
            }}
            onClick={({ id }) => {
                setSelectedTicketId(id)
            }}
            totalCount={data.totalCount}
            sortableColumns={['id']}
        />
    )
}

const TicketFilters = ({
    filter,
    setFilter,
}: {
    filter: TicketFilter
    setFilter: (value: ((prevState: TicketFilter) => TicketFilter) | TicketFilter) => void
}) => {
    const { isWorker, isAdmin } = useContext(AuthContext)
    const [advanced, setAdvanced] = useState(false)
    const [params] = useSearchParams()

    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const { data: users } = useQuery(['users', 'workers'], () => getAllWorkers({}), {
        enabled: isAdmin(),
    })
    const { data: shops } = useQuery('shops', getAllShops, { enabled: isAdmin() })

    useEffect(() => {
        const id = params.get('ticketId')
        if (id) setFilter({ ticketId: +id })
    }, [])

    return advanced ? (
        <Space className='largeFilter' wrap align={'start'}>
            <FilterWrapper title={'General filters'}>
                <Input
                    placeholder='Ticket ID'
                    pattern='[0-9\s]*'
                    value={filter?.ticketId}
                    onChange={({ currentTarget }) =>
                        setFilter({ ...filter, ticketId: currentTarget.value ? +currentTarget.value : undefined })
                    }
                />
                <Select<TicketStatus[], ItemPropertyView>
                    style={{ minWidth: 200, maxWidth: 300, textAlign: 'left' }}
                    dropdownStyle={{ textAlign: 'left' }}
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
                    onChange={(id) => setFilter({ ...filter, brandId: id ?? undefined, modelId: undefined })}
                    getOptionLabel={(brand) => brand.value}
                    getOptionValue={(brand) => brand.id}
                />
                <AppSelect<number, ItemPropertyView>
                    value={filter.modelId}
                    options={filter.brandId ? brands?.find(({ id }) => id == filter.brandId)?.models : models}
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
            <Input
                placeholder='Ticket ID'
                pattern='[0-9\s]*'
                value={filter?.ticketId}
                onChange={({ currentTarget }) =>
                    setFilter({ ...filter, ticketId: currentTarget.value ? +currentTarget.value : undefined })
                }
            />
            <AdvancedSearchButton onClick={() => setAdvanced(true)} />
        </Space>
    )
}
const TicketListItem = ({
    ticket,
    setEditTicketId,
    setSelectedTicketId,
    setCollectTicket,
}: {
    ticket: Ticket
    setEditTicketId: (ticketId: number | undefined) => void
    setSelectedTicketId: React.Dispatch<React.SetStateAction<number | undefined>>
    setCollectTicket: (ticket: Ticket) => void
}) => {
    const deadline = moment(ticket.deadline)

    return (
        <Card
            className='mb-1'
            size='small'
            key={'ticketListId' + ticket.id}
            title={<div onClick={() => setSelectedTicketId(ticket.id)}>Ticket #{ticket.id}</div>}
            extra={<Tag color={getTicketStatusColor(ticket.status)}>{ticket.status}</Tag>}
            hoverable
            actions={[
                <FontAwesomeIcon
                    icon={faPen}
                    className='w-100'
                    key={'edit' + ticket.id}
                    onClick={() => {
                        setEditTicketId(ticket.id)
                    }}
                />,
                <FontAwesomeIcon
                    icon={faCheck}
                    className='w-100'
                    key={'collect' + ticket.id}
                    onClick={() => setCollectTicket(ticket)}
                />,
            ]}
        >
            <div className='task-grid' onClick={() => setSelectedTicketId(ticket.id)}>
                <div>
                    <Tag>
                        {ticket.deviceBrand ?? <span className='ticket-missing-property'>Brand</span>}
                        <br />
                        {ticket.deviceModel ?? <span className='ticket-missing-property'>Model</span>}
                    </Tag>
                </div>

                <div className='align-right'>
                    <Tag>{ticket.deviceLocation}</Tag>
                </div>

                <div>
                    <Tag>Created {moment(ticket.timestamp).fromNow()}</Tag>
                    {collectedTicketStatuses.includes(ticket.status) ? (
                        <Tag color='green'>{dateFormat(ticket.deadline)}</Tag>
                    ) : deadline > moment() ? (
                        <Countdown {...{ deadline }} />
                    ) : (
                        <Tag color='red'>Deadline {deadline.fromNow()}</Tag>
                    )}
                </div>
                <div className='align-right'>
                    <Tag color={!ticket.client ? 'red' : 'blue'} className='align-right user-elipsis'>
                        {getClientString(ticket.client)}
                    </Tag>
                </div>

                {ticket.problemExplanation && (
                    <div className='task-row'>
                        Task: <Tag className='ticket-problem'>{ticket.problemExplanation}</Tag>
                    </div>
                )}
            </div>
        </Card>
    )
}

const Countdown = ({ deadline }: { deadline: moment.Moment }) => {
    const [time, setTime] = useState(moment())
    const diff = moment.duration(deadline.diff(time))
    const countdown = moment.utc(diff.asMilliseconds()).format('HH:mm:ss')
    useEffect(() => {
        const interval = setInterval(() => setTime(moment()), 1000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    return (
        <Tag key={countdown} color={deadline < moment().add(30, 'minutes') ? 'orange' : 'blue'}>
            {countdown}
        </Tag>
    )
}

const getClientString = (user: User) => {
    if (!user) return 'No client'
    return (
        <>
            {user?.fullName && <div>{user?.fullName}</div>}
            {user?.email && <div className='short-email'>{user?.email}</div>}
            {user?.phones &&
                user?.phones.map((phone) => <div key={'user' + user?.userId + 'phone' + phone}>{phone}</div>)}
        </>
    )
}
