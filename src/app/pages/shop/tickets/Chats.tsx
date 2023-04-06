import { stompClient } from '../../../axios/websocketClient'
import React, { useContext, useEffect, useState } from 'react'
import { Discuss } from 'react-loader-spinner'
import { sendMessage, sendMessageSeen } from '../../../axios/websocket/chat'
import { Chat, ChatMessage, CreateChatMessage, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { useQuery } from 'react-query'
import { getAllUsers } from '../../../axios/http/userRequests'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import { fetchAllTickets, fetchChat } from '../../../axios/http/ticketRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane'
import dateFormat from 'dateformat'
import { faArrowRight, faCheckDouble, faCircleCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { dateTimeMask } from '../../../models/enums/appEnums'
import { Button, Card, Descriptions, Menu, Skeleton } from 'antd'
import { ViewTicket } from '../../../components/modals/ticket/ViewTicket'

export const Chats = () => {
    const { loggedUser } = useContext(AuthContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const { data: users } = useQuery(['users'], () => getAllUsers({}))
    const page = { page: 0, pageSize: 10 }
    const { data: tickets } = useQuery(['tickets', page], () => fetchAllTickets({ page, filter: {} }))
    // const { data: tasks } = useQuery('tasks', fetchAllTickets)

    const { userChats, setUserChats, unsentMessages, setUnsentMessages } = useContext(WebSocketContext)
    const [chat, setChat] = useState<Chat | undefined>()
    const { data: oldMessages } = useQuery(
        ['messages', selectedTicket?.client],
        //todo: add ticket Id
        () => fetchChat({ userId: selectedTicket?.client?.userId ?? '' }),
        {
            enabled: !!selectedTicket?.client?.userId,
            onSuccess: (data) => {
                if (selectedTicket?.client?.userId) {
                    setUserChats((prevState) => {
                        prevState[selectedTicket?.client?.userId] = []
                        return { ...prevState }
                    })
                    setUnsentMessages((prevState) => {
                        return [...prevState.filter((unsent) => !data.some((msg) => msg.randomId === unsent.randomId))]
                    })
                    const received = data.filter((msg) => msg.receiver === loggedUser?.userId)
                    sendMessageSeen(received[received.length - 1]).then()
                }
            },
        }
    )
    const [messageText, setMessageText] = useState('')

    useEffect(() => {
        if (selectedTicket) {
            const userMessages = selectedTicket?.client?.userId ? userChats[selectedTicket.client.userId] ?? [] : []
            const old = oldMessages ?? []
            const messagesByUser = [...old, ...userMessages, ...unsentMessages].sort(
                (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
            )
            const receiver = users?.find((user) => user.userId === selectedTicket?.client?.userId)
            setChat({ chat: messagesByUser, receiver, sender: loggedUser } as Chat)
        }
    }, [selectedTicket, userChats, unsentMessages, oldMessages])

    const send = async (messageText: string, loggedUser: User, ticket: Ticket) => {
        const message: CreateChatMessage = {
            timestamp: new Date(),
            sender: loggedUser.userId,
            text: messageText,
            ticketId: ticket?.id,
            receiver: ticket?.client?.userId,
            randomId: Math.floor(Math.random() * 1000000),
        }
        setUnsentMessages((unsent) => [...unsent, message as ChatMessage])
        setMessageText('')
        await sendMessage(message)
    }
    // const closeConnection = () => {
    //     stompClient.deactivate().then()
    // }

    return (
        <div className='mainScreen'>
            <div className='flex-100'>
                <div className={'chatContainer'}>
                    <div className='ticketInfo'>
                        <TicketChatInfo ticket={selectedTicket} />
                    </div>
                    <div className='chatBox'>
                        {stompClient.connected && selectedTicket ? (
                            chat?.chat.map((value, index, array) => (
                                <ChatMessageRow
                                    receiver={chat?.receiver}
                                    sender={chat?.sender}
                                    key={index}
                                    message={value}
                                    isLastMessage={index === 0}
                                    showUser={!array[index - 1] || array[index - 1].receiver != value.receiver}
                                />
                            ))
                        ) : selectedTicket?.client?.userId ? (
                            <>
                                <div className='w-100'>
                                    <Discuss />
                                </div>
                                Loading messages
                            </>
                        ) : (
                            <div className={'w-100'}>
                                <FontAwesomeIcon icon={faArrowRight} size={'xl'} />
                                <h4>Please select a ticket to see its chat</h4>
                            </div>
                        )}
                    </div>
                    <div className='messageField'>
                        <input
                            className='input'
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' &&
                                loggedUser &&
                                selectedTicket &&
                                messageText.trim().length > 0 &&
                                send(messageText, loggedUser, selectedTicket)
                            }
                            aria-autocomplete='none'
                            disabled={!selectedTicket}
                            autoFocus
                        />
                        <Button
                            type='primary'
                            className={`sendButton icon-s`}
                            disabled={!stompClient.connected || !selectedTicket?.client?.userId}
                            onClick={() =>
                                loggedUser && selectedTicket && send(messageText, loggedUser, selectedTicket)
                            }
                        >
                            <FontAwesomeIcon color='white' size='lg' icon={faPaperPlane} />
                        </Button>
                    </div>
                </div>

                <div className='ticketChatContainer'>
                    {tickets && tickets.content.length > 0 ? (
                        <Menu
                            onSelect={(item) => {
                                setSelectedTicket(tickets?.content.find((ticket) => ticket.id === +item.key))
                            }}
                            mode='inline'
                            items={tickets.content.map((ticket) => ({
                                label: `Ticket#${ticket.id}`,
                                key: ticket.id,
                            }))}
                        />
                    ) : (
                        <Skeleton loading={true} />
                    )}
                </div>
            </div>
        </div>
    )
}

const TicketChatInfo = ({ ticket }: { ticket: Ticket | undefined }) => {
    const [showModal, setShowModal] = useState(false)
    if (!ticket) return <></>
    return (
        <Card
            title={`Ticket#${ticket.id} Info`}
            extra={<Button onClick={() => setShowModal(true)}>Show full ticket</Button>}
        >
            <ViewTicket ticket={showModal ? ticket : undefined} closeModal={() => setShowModal(false)} />
            <Descriptions size='small' layout='vertical'>
                <Descriptions.Item label='Created at'>{dateFormat(ticket.timestamp, dateTimeMask)}</Descriptions.Item>
                <Descriptions.Item label='Deadline'>{dateFormat(ticket.deadline, dateTimeMask)}</Descriptions.Item>
                <Descriptions.Item label='Status'>{ticket.status}</Descriptions.Item>
                {ticket?.client && (
                    <Descriptions.Item label='Client'>
                        {ticket.client.fullName} {ticket.client.email}
                    </Descriptions.Item>
                )}
                <Descriptions.Item label='Customer Request'>{ticket.customerRequest}</Descriptions.Item>
                <Descriptions.Item label='Created by'>{ticket.createdBy.fullName}</Descriptions.Item>
                <Descriptions.Item label='Problem'>{ticket.problemExplanation}</Descriptions.Item>
                <Descriptions.Item label='Notes'>{ticket.notes}</Descriptions.Item>
            </Descriptions>
        </Card>
    )
}

const ChatMessageRow = ({
    message,
    showUser,
    isLastMessage,
    sender,
    receiver,
}: {
    message: ChatMessage
    showUser: boolean
    isLastMessage: boolean
    receiver?: User
    sender?: User
}) => {
    const { loggedUser } = useContext(AuthContext)
    const isSenderLoggedUser = message.sender === loggedUser?.userId
    const user = isSenderLoggedUser ? sender : receiver
    const Icon = !message.id ? (
        <FontAwesomeIcon icon={faSpinner} title={'Sending'} />
    ) : message.readByReceiver ? (
        isSenderLoggedUser && isLastMessage ? (
            <FontAwesomeIcon icon={faCheckDouble} title={'Seen at ' + dateFormat(message.readByReceiver)} />
        ) : (
            <></>
        )
    ) : (
        <FontAwesomeIcon icon={faCircleCheck} title={'Sent'} />
    )
    return (
        <>
            <div className={isSenderLoggedUser ? 'message-sender' : 'message-receiver'}>
                <div>
                    {showUser && user && (
                        <div className='user'>
                            <span> {user.fullName} </span>
                            <span>{dateFormat(message.timestamp)}</span>
                        </div>
                    )}
                    <div className='message-wrapper'>
                        <div className='message' title={dateFormat(message.timestamp)}>
                            {message.text}
                        </div>
                        {Icon}
                    </div>
                </div>
            </div>
        </>
    )
}
