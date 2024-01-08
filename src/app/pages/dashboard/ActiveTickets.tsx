import { Button, Card, Space, Tooltip } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { CustomSuspense } from '../../components/CustomSuspense'
import { ShortTicketTable } from '../../components/table/ShortTicketTable'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { fetchAllTickets } from '../../axios/http/ticketRequests'
import { useNavigate } from 'react-router-dom'
import { TicketFilter } from '../../models/interfaces/filters'
import { TicketView } from '../../components/modals/ticket/TicketView'
import { AddTicket } from '../../components/modals/ticket/AddTicket'
import { Ticket } from '../../models/interfaces/ticket'
import { AuthContext } from '../../contexts/AuthContext'
import CheckableTag from 'antd/es/tag/CheckableTag'
import { defaultPage } from '../../models/enums/defaultValues'
import { activeTicketStatuses, waitingTicketStatuses } from '../../models/enums/ticketEnums'
import { faTicket } from '@fortawesome/free-solid-svg-icons'

export const ActiveTickets = ({
    filter,
    setFilter,
}: {
    filter: TicketFilter
    setFilter: (filter: TicketFilter) => void
}) => {
    const navigate = useNavigate()
    const [page, setPage] = useState(defaultPage)
    const { loggedUser } = useContext(AuthContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const isUserFromShop = filter.shopId === loggedUser?.shopId
    const onSelectedTicketUpdate = (data: Ticket[]) => {
        setSelectedTicket((ticket) => (ticket ? data.find(({ id }) => ticket.id === id) : undefined))
    }
    const { data: tickets, isLoading } = useQuery(
        ['tickets', 'active', filter],
        () =>
            fetchAllTickets({
                page,
                filter: {
                    ...filter,
                    ticketStatuses: filter.hideCompleted ? activeTicketStatuses : waitingTicketStatuses,
                },
            }),
        {
            onSuccess: (data) => {
                onSelectedTicketUpdate(data.content)
            },
        }
    )

    const ticketType = filter.hideCompleted ? 'Active' : 'Waiting'
    const title = tickets?.totalCount ? `${ticketType} Tickets: ${tickets.totalCount}` : `No ${ticketType} tickets`

    return (
        <Card
            className='dashboard-card'
            title={
                <Tooltip title='Open Tickets page'>
                    <Button
                        icon={<FontAwesomeIcon icon={faTicket} />}
                        type='dashed'
                        onClick={() => navigate('/tickets')}
                        children={title}
                        disabled={!isUserFromShop}
                    />
                </Tooltip>
            }
            extra={
                <Space style={{ marginLeft: 20 }} wrap>
                    <CheckableTag
                        checked={filter.hideCompleted ?? false}
                        children={filter.hideCompleted ? 'Display Waiting tickets' : 'Display Active tickets'}
                        onChange={(checked) => setFilter({ ...filter, hideCompleted: checked })}
                    ></CheckableTag>
                    <Button
                        type='primary'
                        size={'small'}
                        onClick={() => setShowNewTicketModal(true)}
                        disabled={!isUserFromShop}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                        Create new
                    </Button>
                </Space>
            }
        >
            {isUserFromShop && (
                <>
                    <TicketView ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
                    <AddTicket isModalOpen={showNewTicketModal} closeModal={() => setShowNewTicketModal(false)} />
                </>
            )}
            <CustomSuspense isReady={!isLoading}>
                <ShortTicketTable
                    page={page}
                    setPage={setPage}
                    data={tickets?.content}
                    onClick={({ id }) =>
                        setSelectedTicket(tickets?.content.find(({ id: ticketId }) => id === ticketId))
                    }
                />
            </CustomSuspense>
            <Space align={'start'} className={'w-100'}></Space>
        </Card>
    )
}
