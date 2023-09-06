import React, { useContext, useEffect, useState } from 'react'
import { sendMessageSeen } from '../../../axios/websocket/chat'
import { Chat, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { useQuery } from 'react-query'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import {
    fetchAllActiveTickets,
    fetchClientActiveTickets,
    getChat,
    getClientChat,
} from '../../../axios/http/ticketRequests'
import { Badge, Drawer, Menu, Space } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { sortChatByDate } from '../../../utils/helperFunctions'
import { TicketChatInfo } from './ChatTicketDetails'
import { ChatMessages } from './ChatMessages'
import { MessageInputField } from './ChatInputField'
import { CustomSuspense } from '../../../components/CustomSuspense'
import { NoDataComponent } from '../../../components/table/NoDataComponent'
import CheckableTag from 'antd/es/tag/CheckableTag'
import { TicketFilter } from '../../../models/interfaces/filters'
import { activeTicketStatuses, completedTicketStatuses } from '../../../models/enums/ticketEnums'

export const Chats = () => {
    const { isClient, loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>({ hideCompleted: true, shopId: loggedUser?.shopId })
    const { data: tickets, isLoading } = useQuery(['tickets', filter], () => {
        const query = isClient() ? fetchClientActiveTickets : fetchAllActiveTickets
        return query({
            filter: {
                ...filter,
                ticketStatuses: filter.hideCompleted
                    ? activeTicketStatuses
                    : activeTicketStatuses.concat(completedTicketStatuses),
            },
        })
    })
    return (
        <CustomSuspense isReady={!isLoading}>
            <InnerChats tickets={tickets} filter={filter} setFilter={setFilter} />
        </CustomSuspense>
    )
}

export const InnerChats = ({
    tickets,
    filter,
    setFilter,
}: {
    tickets?: Ticket[]
    filter: TicketFilter
    setFilter: React.Dispatch<React.SetStateAction<TicketFilter>>
}) => {
    const { loggedUser, isClient } = useContext(AuthContext)
    const navigate = useNavigate()
    const { userChats, setUserChats, notificationCount } = useContext(WebSocketContext)

    const [chat, setChat] = useState<Chat | undefined>()
    const [params] = useSearchParams()
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>(
        tickets?.find((ticket) => String(ticket.id) === params.get('id'))
    )
    const [ticketDrawer, setTicketDrawer] = useState(!selectedTicket)

    const { data: oldMessages } = useQuery(
        ['messages', selectedTicket?.id],
        () => {
            const request = isClient() ? getClientChat : getChat
            return request({ ticketId: selectedTicket?.id })
        },
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
            navigate({ search: 'id=' + selectedTicket.id }, { replace: true })
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
                extra={
                    <CheckableTag
                        checked={filter.hideCompleted ?? false}
                        onChange={(isChecked) => setFilter((filter) => ({ ...filter, hideCompleted: isChecked }))}
                    >
                        Hide completed tickets
                    </CheckableTag>
                }
            >
                <Space direction={'vertical'} className='w-100'>
                    {tickets && tickets.length > 0 ? (
                        <Menu
                            onSelect={(item) => {
                                setSelectedTicket(tickets?.find((ticket) => ticket.id === +item.key))
                            }}
                            defaultSelectedKeys={[String(selectedTicket?.id)]}
                            mode='inline'
                            items={tickets.map((ticket) => ({
                                label: `Ticket#${ticket.id}`,
                                key: ticket.id,
                                icon: <Badge count={notificationCount[ticket.id]} />,
                            }))}
                        />
                    ) : (
                        <NoDataComponent items={'active tickets'} />
                    )}
                </Space>
            </Drawer>
        </div>
    )
}
