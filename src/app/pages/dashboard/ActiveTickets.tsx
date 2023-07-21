import { Button, Card, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { CustomSuspense } from '../../components/CustomSuspense'
import { ShortTicketTable } from '../../components/table/ShortTicketTable'
import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { fetchAllActiveTickets } from '../../axios/http/ticketRequests'
import { useNavigate } from 'react-router-dom'
import { TicketFilter } from '../../models/interfaces/filters'
import { ViewTicket } from '../../components/modals/ticket/ViewTicket'
import { AddTicket } from '../../components/modals/ticket/AddTicket'
import { Ticket } from '../../models/interfaces/ticket'

export const ActiveTickets = ({ filter }: { filter: TicketFilter }) => {
    const navigate = useNavigate()
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const onSelectedTicketUpdate = (data: Ticket[]) => {
        setSelectedTicket((ticket) => (ticket ? data.find(({ id }) => ticket.id === id) : undefined))
    }
    const { data: tickets, isLoading } = useQuery(
        ['tickets', 'active', filter],
        () => fetchAllActiveTickets({ filter }),
        { onSuccess: onSelectedTicketUpdate }
    )
    return (
        <Card
            style={{ minWidth: 250 }}
            title={`Active Tickets: ${tickets?.length ?? 0}`}
            extra={
                <Space>
                    <Button
                        type='primary'
                        onClick={() => setShowNewTicketModal(true)}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                        Create new
                    </Button>
                    <Button type='link' onClick={() => navigate('/tickets')} children={'See All'} />
                </Space>
            }
        >
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewTicketModal} closeModal={() => setShowNewTicketModal(false)} />
            <CustomSuspense isReady={!isLoading}>
                <ShortTicketTable
                    data={tickets}
                    onClick={({ id }) => setSelectedTicket(tickets?.find(({ id: ticketId }) => id === ticketId))}
                />
            </CustomSuspense>
        </Card>
    )
}
