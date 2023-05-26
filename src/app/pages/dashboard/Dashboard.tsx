import { TicketFilter } from '../../models/interfaces/filters'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { Shop } from '../../models/interfaces/shop'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { DateTimeFilter } from '../../components/filters/DateTimeFilter'
import { Button, Card, Col, Row, Space } from 'antd'
import { ShortTicketTable } from '../../components/table/ShortTicketTable'
import { Ticket } from '../../models/interfaces/ticket'
import { fetchAllActiveTickets } from '../../axios/http/ticketRequests'
import { CustomSuspense } from '../../components/CustomSuspense'
import { useNavigate } from 'react-router-dom'
import { ViewTicket } from '../../components/modals/ticket/ViewTicket'
import { AddTicket } from '../../components/modals/ticket/AddTicket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { AuthContext } from '../../contexts/AuthContext'
import { defaultDashboardFilter } from '../../models/enums/defaultValues'
import { InvoicesReport } from '../../components/reports/InvoicesReport'
import { RepairsReport } from '../../components/reports/RepairsReport'

export const Dashboard = () => {
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>(defaultDashboardFilter(loggedUser?.shopId))
    const navigate = useNavigate()

    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)

    // const { data: users } = useQuery(['users'], () => getAllUsers({}))
    const { data: tickets, isLoading } = useQuery(['tickets', 'active', filter], () =>
        fetchAllActiveTickets({ filter })
    )

    return (
        <Space direction='vertical' className='w-100'>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewTicketModal} closeModal={() => setShowNewTicketModal(false)} />
            <Space className='w-100 justify-between p-2'>
                <h2>Dashboard</h2>
                <DashboardFilters {...{ filter, setFilter }} />
            </Space>
            <Row wrap>
                <Col span={12} offset={1}>
                    <InvoicesReport filter={filter} />
                </Col>
                <Col span={8} offset={1}>
                    <RepairsReport filter={filter} />
                </Col>
            </Row>
            <Row wrap>
                <Col span={12} offset={1}>
                    <Card
                        style={{ minWidth: 350 }}
                        title={`Active Tickets: ${tickets?.length ?? 0} `}
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
                                    setSelectedTicket(tickets?.find(({ id: ticketId }) => id === ticketId))
                                }
                            />
                        </CustomSuspense>
                    </Card>
                </Col>
            </Row>
        </Space>
    )
}

export const DashboardFilters = ({
    filter,
    setFilter,
}: {
    filter: TicketFilter
    setFilter: (value: ((prevState: TicketFilter) => TicketFilter) | TicketFilter) => void
}) => {
    const { loggedUser } = useContext(AuthContext)
    //todo: use checkRole function.
    const { data: shops } = useQuery('shops', getAllShops, { enabled: loggedUser?.role === 'ADMIN' })

    return (
        <Space>
            <div className='filterField'>
                {loggedUser?.role === 'ADMIN' && (
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
                )}
            </div>
            <DateTimeFilter
                filter={filter}
                setFilter={setFilter}
                dataKeys={{ before: 'createdBefore', after: 'createdAfter' }}
            />
        </Space>
    )
}
