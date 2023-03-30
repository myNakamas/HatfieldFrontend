import { Filter, InventoryFilter } from '../../models/interfaces/filters'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { Shop } from '../../models/interfaces/shop'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { DateTimeFilter } from '../../components/filters/DateTimeFilter'
import { Button, Card, Space } from 'antd'
import { ShortTicketTable } from '../../components/table/ShortTicketTable'
import { Ticket } from '../../models/interfaces/ticket'
import { fetchAllTickets } from '../../axios/http/ticketRequests'
import { activeTicketStatuses } from '../../models/enums/ticketEnums'
import { CustomSuspense } from '../../components/CustomSuspense'
import { useNavigate } from 'react-router-dom'
import { ViewTicket } from '../../components/modals/ticket/ViewTicket'
import { AddTicket } from '../../components/modals/ticket/AddTicket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

export const Dashboard = () => {
    const [filter, setFilter] = useState<Filter>({})
    const navigate = useNavigate()

    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const [page, setPage] = useState({ page: 1, pageSize: 10 })

    // const { data: users } = useQuery(['users'], () => getAllUsers({}))
    const { data: tickets, isLoading } = useQuery(['tickets', { filter: activeTicketStatuses }, page], () =>
        fetchAllTickets({ page, filter: { ticketStatuses: activeTicketStatuses } })
    )
    const data = [
        { uv: 1, pv: 2 },
        { uv: 5, pv: 2 },
        { uv: 3, pv: 1 },
        { uv: 6, pv: 2 },
    ]

    return (
        <Space direction='vertical'>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewTicketModal} closeModal={() => setShowNewTicketModal(false)} />
            <DashboardFilters {...{ filter, setFilter }} />
            <Space>
                <Card
                    title={`Active Tickets: ${tickets?.totalCount}`}
                    extra={
                        <Space>
                            <Button
                                type='primary'
                                onClick={() => setShowNewTicketModal(true)}
                                icon={<FontAwesomeIcon icon={faPlus} />}
                            />
                            <Button type='link' onClick={() => navigate('/tickets')} children={'See All Tickets'} />
                        </Space>
                    }
                >
                    <CustomSuspense isReady={!isLoading}>
                        <ShortTicketTable
                            data={tickets}
                            onClick={({ id }) =>
                                setSelectedTicket(tickets?.content.find(({ id: ticketId }) => id === ticketId))
                            }
                            page={page}
                            setPage={setPage}
                        />
                    </CustomSuspense>
                </Card>
            </Space>
        </Space>
    )
}

export const DashboardFilters = ({
    filter,
    setFilter,
}: {
    filter: InventoryFilter
    setFilter: (value: ((prevState: InventoryFilter) => InventoryFilter) | InventoryFilter) => void
}) => {
    const { data: shops } = useQuery('shops', getAllShops)

    return (
        <Space>
            <div className='filterField'>
                <Select<Shop, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={shops?.find(({ id }) => filter.modelId === id)}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, modelId: value?.id ?? undefined })}
                    getOptionLabel={(shop) => shop.shopName}
                    getOptionValue={(shop) => String(shop.id)}
                />
            </div>
            <DateTimeFilter filter={filter} setFilter={setFilter} />
        </Space>
    )
}
