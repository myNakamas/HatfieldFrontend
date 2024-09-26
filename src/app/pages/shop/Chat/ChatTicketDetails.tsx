import React, { useState } from 'react'
import { Ticket } from '../../../models/interfaces/ticket'
import dateFormat from 'dateformat'
import { dateTimeMask } from '../../../models/enums/appEnums'
import { Button, Collapse, Descriptions, Space, Typography } from 'antd'
import { TicketView } from '../../../components/modals/ticket/TicketView'
import { useQueryClient } from 'react-query'

export const TicketChatInfo = ({ ticket, openDrawer }: { ticket: Ticket | undefined; openDrawer: () => void }) => {
    const [showModal, setShowModal] = useState(false)
    const queryClient = useQueryClient();
    const [smallScreen, setSmallScreen] = useState<boolean>(window.innerWidth < 768)
    window.addEventListener('resize', () => setSmallScreen(window.innerWidth < 768))
    if (!ticket) return <></>
    return (
        <div className='ticketInfo'>
            <TicketView ticketId={ticket.id} open={showModal} closeModal={() => {setShowModal(false)
                    queryClient.invalidateQueries(["tickets"]);
            }} />
            <Collapse
                defaultActiveKey={!smallScreen ? 'ticket' : ''}
                collapsible={'header'}
                accordion
                items={[
                    {
                        key: 'ticket',
                        label: `Ticket #${ticket.id} info`,

                        extra: (
                            <Space wrap>
                                <Button onClick={() => setShowModal(true)}>Show full ticket</Button>
                                <Button type='primary' onClick={() => openDrawer()}>
                                    See all tickets
                                </Button>
                            </Space>
                        ),
                        children: (
                            <Descriptions size='small' layout='vertical'>
                                <Descriptions.Item label='Created at'>
                                    {dateFormat(ticket.timestamp, dateTimeMask)}
                                </Descriptions.Item>
                                <Descriptions.Item label='Deadline'>
                                    {dateFormat(ticket.deadline, dateTimeMask)}
                                </Descriptions.Item>
                                <Descriptions.Item label='Status'>{ticket.status}</Descriptions.Item>
                                {ticket?.client && (
                                    <Descriptions.Item label='Client'>
                                        {ticket.client.fullName} {ticket.client.email}
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label='Customer Request'>{ticket.customerRequest}</Descriptions.Item>
                                <Descriptions.Item label='Problem'><Typography.Paragraph ellipsis={{rows:3}}>{ticket.problemExplanation}</Typography.Paragraph ></Descriptions.Item>
                                {!smallScreen && (
                                    <>
                                        <Descriptions.Item label='Created by'>
                                            {ticket.createdBy.fullName}
                                        </Descriptions.Item>
                                        <Descriptions.Item label='Notes'>{ticket.notes}</Descriptions.Item>
                                    </>
                                )}
                            </Descriptions>
                        ),
                    },
                ]}
            />
        </div>
    )
}
