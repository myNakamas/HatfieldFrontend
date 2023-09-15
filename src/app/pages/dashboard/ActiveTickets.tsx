import { Button, Card, Space } from 'antd'
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
            style={{ minWidth: 250 }}
            title={title}
            extra={
                <Space style={{ marginLeft: 20 }}>
                    <Button
                        type='primary'
                        size={'small'}
                        onClick={() => setShowNewTicketModal(true)}
                        disabled={!isUserFromShop}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                        Create new
                    </Button>
                    {isUserFromShop && <Button type='link' onClick={() => navigate('/tickets')} children={'See All'} />}
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
            <Space align={'start'} className={'w-100'}>
                <CheckableTag
                    checked={filter.hideCompleted ?? false}
                    onChange={(checked) => setFilter({ ...filter, hideCompleted: checked })}
                >
                    Display Active tickets
                </CheckableTag>
            </Space>
        </Card>
    )
}
