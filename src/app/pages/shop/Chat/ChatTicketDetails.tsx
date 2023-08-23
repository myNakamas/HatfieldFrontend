import React, { useState } from 'react'
import { Ticket } from '../../../models/interfaces/ticket'
import dateFormat from 'dateformat'
import { dateTimeMask } from '../../../models/enums/appEnums'
import { Button, Card, Descriptions, Space } from 'antd'
import { TicketView } from '../../../components/modals/ticket/TicketView'

export const TicketChatInfo = ({ ticket, openDrawer }: { ticket: Ticket | undefined; openDrawer: () => void }) => {
    const [showModal, setShowModal] = useState(false)
    const [smallScreen, setSmallScreen] = useState<boolean>(window.innerWidth < 768)
    window.addEventListener('resize', () => setSmallScreen(window.innerWidth < 768))
    if (!ticket) return <></>
    return (
        <div className='ticketInfo'>
            <Card
                title={`Ticket#${ticket.id} Info`}
                extra={
                    <Space wrap>
                        <Button onClick={() => setShowModal(true)}>Show full ticket</Button>
                        <Button type='primary' onClick={() => openDrawer()}>
                            See all tickets
                        </Button>
                    </Space>
                }
            >
                <TicketView ticket={showModal ? ticket : undefined} closeModal={() => setShowModal(false)} />
                <Descriptions size='small' layout='vertical'>
                    {!smallScreen && (
                        <>
                            <Descriptions.Item label='Created at'>
                                {dateFormat(ticket.timestamp, dateTimeMask)}
                            </Descriptions.Item>
                            <Descriptions.Item label='Deadline'>
                                {dateFormat(ticket.deadline, dateTimeMask)}
                            </Descriptions.Item>
                        </>
                    )}
                    <Descriptions.Item label='Status'>{ticket.status}</Descriptions.Item>
                    {ticket?.client && (
                        <Descriptions.Item label='Client'>
                            {ticket.client.fullName} {ticket.client.email}
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label='Customer Request'>{ticket.customerRequest}</Descriptions.Item>
                    <Descriptions.Item label='Problem'>{ticket.problemExplanation}</Descriptions.Item>
                    {!smallScreen && (
                        <>
                            <Descriptions.Item label='Created by'>{ticket.createdBy.fullName}</Descriptions.Item>
                            <Descriptions.Item label='Notes'>{ticket.notes}</Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            </Card>
        </div>
    )
}
