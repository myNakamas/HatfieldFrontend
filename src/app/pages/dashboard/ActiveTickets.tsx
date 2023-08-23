import { Button, Card, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { CustomSuspense } from '../../components/CustomSuspense'
import { ShortTicketTable } from '../../components/table/ShortTicketTable'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { fetchAllActiveTickets } from '../../axios/http/ticketRequests'
import { useNavigate } from 'react-router-dom'
import { TicketFilter } from '../../models/interfaces/filters'
import { TicketView } from '../../components/modals/ticket/TicketView'
import { AddTicket } from '../../components/modals/ticket/AddTicket'
import { Ticket } from '../../models/interfaces/ticket'
import { AuthContext } from '../../contexts/AuthContext'

export const ActiveTickets = ({ filter }: { filter: TicketFilter }) => {
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const isUserFromShop = filter.shopId === loggedUser?.shopId
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
                    data={tickets}
                    onClick={({ id }) => setSelectedTicket(tickets?.find(({ id: ticketId }) => id === ticketId))}
                />
            </CustomSuspense>
        </Card>
    )
}
