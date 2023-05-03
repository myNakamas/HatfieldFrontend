import React, { useContext, useEffect, useState } from 'react'
import { sendMessageSeen } from '../../../axios/websocket/chat'
import { Chat, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { useQuery } from 'react-query'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import { fetchAllTickets, useGetChat } from '../../../axios/http/ticketRequests'
import { Drawer, Menu, Skeleton, Space, Typography } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { sortChatByDate } from '../../../utils/helperFunctions'
import { TicketChatInfo } from './ChatTicketDetails'
import { ChatMessages } from './ChatMessages'
import { MessageInputField } from './ChatInputField'

export const Chats = () => {
    const page = { page: 0, pageSize: 10 }
    const { loggedUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const { userChats, setUserChats, notificationCount } = useContext(WebSocketContext)
    const { data: tickets } = useQuery(['tickets', page], () => fetchAllTickets({ page, filter: {} }))
    const [chat, setChat] = useState<Chat | undefined>()
    const [params] = useSearchParams()
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>(
        tickets?.content.find((ticket) => String(ticket.id) === params.get('id'))
    )
    const [ticketDrawer, setTicketDrawer] = useState(!selectedTicket)

    const { data: oldMessages } = useQuery(
        ['messages', selectedTicket?.id],
        () => useGetChat({ ticketId: selectedTicket?.id }),
        {
            onSuccess: () => {
                if (selectedTicket?.id) {
                    setUserChats((prev) => {
                        prev[selectedTicket.id] = []
                        return { ...prev }
                    })
                }
            },
        }
    )

    useEffect(() => {
        if (selectedTicket) {
            navigate({ search: 'id=' + selectedTicket.id })
            const userMessages = selectedTicket?.id ? userChats[selectedTicket.id] ?? [] : []
            const messagesByUser = oldMessages?.concat(userMessages).sort(sortChatByDate)
            setChat((prev) => ({ ...prev, chat: messagesByUser } as Chat))

            if (messagesByUser) {
                const received = messagesByUser?.filter((msg) => msg.receiver === loggedUser?.userId)
                const lastMessage = received[received.length - 1]
                if (!lastMessage?.readByReceiver) sendMessageSeen(lastMessage).then()
            }
        }
    }, [selectedTicket, userChats, oldMessages])

    return (
        <div className='mainScreen flex-100'>
            <div className={'chatContainer'}>
                <TicketChatInfo ticket={selectedTicket} openDrawer={() => setTicketDrawer((prev) => !prev)} />
                <ChatMessages openDrawer={() => setTicketDrawer((prev) => !prev)} {...{ selectedTicket, chat }} />
                <MessageInputField selectedTicket={selectedTicket} />
            </div>

            <Drawer
                title='Tickets'
                placement={'right'}
                closable={true}
                bodyStyle={{ padding: 0 }}
                width={300}
                onClose={() => setTicketDrawer(false)}
                open={ticketDrawer}
            >
                <Space direction={'vertical'} className='w-100'>
                    {tickets && tickets.content.length > 0 ? (
                        <Menu
                            onSelect={(item) => {
                                setSelectedTicket(tickets?.content.find((ticket) => ticket.id === +item.key))
                            }}
                            defaultSelectedKeys={[String(selectedTicket?.id)]}
                            mode='inline'
                            items={tickets.content.map((ticket) => ({
                                label: `Ticket#${ticket.id}`,
                                key: ticket.id,
                                icon:
                                    notificationCount[ticket.id] > 0 ? (
                                        <Typography className={'icon-s abs-icon'}>
                                            {notificationCount[ticket.id]}
                                        </Typography>
                                    ) : (
                                        <></>
                                    ),
                            }))}
                        />
                    ) : (
                        <Skeleton loading={true} />
                    )}
                </Space>
            </Drawer>
        </div>
    )
}
