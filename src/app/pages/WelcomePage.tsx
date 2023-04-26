import { useQuery } from 'react-query'
import { fetchAllActiveTickets } from '../axios/http/ticketRequests'
import { TicketFilter } from '../models/interfaces/filters'
import { AuthContext } from '../contexts/AuthContext'
import React, { ReactNode, useContext, useState } from 'react'
import { Button, Card, Col, Row, Space } from 'antd'
import { CustomSuspense } from '../components/CustomSuspense'
import { ShortTicketTable } from '../components/table/ShortTicketTable'
import { useNavigate } from 'react-router-dom'
import { ViewTicket } from '../components/modals/ticket/ViewTicket'
import { Ticket } from '../models/interfaces/ticket'
import { AppFooter } from '../components/navigation/AppFooter'

export const WelcomePage = () => {
    const { loggedUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const filter: TicketFilter = { clientId: loggedUser?.userId }
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()

    const { data: tickets, isLoading } = useQuery(['tickets', 'active', filter], () =>
        fetchAllActiveTickets({ filter })
    )

    return (
        <div className={'mainScreen'}>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <Row>
                <GridCol>
                    <Card
                        style={{ minWidth: 350 }}
                        title={`Your Active Tickets: `}
                        extra={
                            <Space>
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
                </GridCol>
                <GridCol></GridCol>
            </Row>
            <AppFooter/>

        </div>
    )
}
const GridCol =({children}:{children?:ReactNode})=> <Col span={10}>{children}</Col>

