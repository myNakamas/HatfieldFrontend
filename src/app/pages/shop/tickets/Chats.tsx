import { stompClient } from '../../../axios/websocketClient'
import { useContext, useEffect, useState } from 'react'
import { Discuss } from 'react-loader-spinner'
import { sendMessage, sendMessageSeen } from '../../../axios/websocket/chat'
import { Chat, ChatMessage, CreateChatMessage, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { useQuery } from 'react-query'
import { getAllUsers } from '../../../axios/http/userRequests'
import { MenuHeader } from '@szhsin/react-menu'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import { fetchAllTickets, fetchChat } from '../../../axios/http/ticketRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane'
import dateFormat from 'dateformat'
import { faArrowRight, faCheckDouble, faCircleCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { dateTimeMask } from '../../../models/enums/appEnums'

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
                    sendMessageSeen(received[received.length - 1])
                }

                //    todo: send the 'seen mark'
                //     send the last read message and the backend can fill all before.
                //     also subscribe to the seen websocket
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

    const send = async (messageText: string, loggedUser: User, selectedReceiver: User) => {
        const message: CreateChatMessage = {
            timestamp: new Date(),
            sender: loggedUser.userId,
            text: messageText,
            ticketId: 1,
            receiver: selectedReceiver?.userId,
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
                        {stompClient.connected && selectedTicket?.client?.userId ? (
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
                                send(messageText, loggedUser, selectedTicket.client)
                            }
                            aria-autocomplete='none'
                            disabled={!selectedTicket?.client?.userId}
                            autoFocus
                        />
                        <button
                            className={`sendButton icon-s ${selectedTicket?.client?.userId && 'clickable'}`}
                            disabled={!stompClient.connected || !selectedTicket?.client?.userId}
                            onClick={() =>
                                loggedUser && selectedTicket && send(messageText, loggedUser, selectedTicket.client)
                            }
                        >
                            <FontAwesomeIcon size='lg' icon={faPaperPlane} />
                        </button>
                    </div>
                </div>

                <div className='ticketChatContainer'>
                    {tickets &&
                        tickets?.content.map((ticket, index) => (
                            <div
                                key={'user' + index}
                                className={`clickable ticketThumb ${
                                    selectedTicket?.id === ticket.id && 'selectedTicket'
                                } `}
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                <MenuHeader className='menu '>
                                    <div className='username'>Ticket#{ticket.id}</div>
                                    <div className='role'>
                                        {ticket.deviceModel} : {ticket.deviceBrand}
                                    </div>
                                    <div className='role'>
                                        {ticket.client?.username} , {ticket.client?.email}
                                    </div>
                                </MenuHeader>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

const TicketChatInfo = ({ ticket }: { ticket: Ticket | undefined }) => {
    if (!ticket) return <></>
    //todo: keep only the important information and add a button to open the full modal
    return (
        <div className='flex-100'>
            <div className='column'>
                <div>
                    <h2>Ticket #{ticket.id}</h2>
                </div>
                <div>
                    <b>Ticket status</b> {ticket.status}
                </div>
                <div>
                    <b>Current Location</b> {ticket.deviceLocation}
                </div>

                <div>
                    <b>Created at:</b>
                    {dateFormat(ticket.timestamp, dateTimeMask)}
                </div>
                <div>
                    <b>Deadline</b>
                    {dateFormat(ticket.deadline, dateTimeMask)}
                </div>
                {ticket.client && (
                    <div>
                        <p>
                            <b>Client</b> {ticket.client.fullName + ' ' + ticket.client.email}
                        </p>
                    </div>
                )}
                <div className='flex-grow'>
                    <h3>Device details</h3>

                    <p>
                        <b>Brand</b> {ticket.deviceBrand}
                    </p>
                    <p>
                        <b>Model</b> {ticket.deviceModel}
                    </p>
                    <p>
                        <b>Serial number / IMEI</b> {ticket.serialNumberOrImei}
                    </p>
                    <p>
                        <b>Device password</b> {ticket.devicePassword}
                    </p>
                    <p>
                        <b>Device condition</b> {ticket.deviceCondition}
                    </p>
                </div>
            </div>
            <div className='column'>
                <b>Problem explanation</b>
                <p>{ticket.problemExplanation}</p>
                <h3>Payment</h3>
                <b>Deposit</b>
                <p>{ticket.deposit?.toFixed(2)}</p>
                <b>Total price</b>
                <p>{ticket.totalPrice?.toFixed(2)}</p>
                <h3>Other information</h3>
                <b>Customer request</b>
                <p>{ticket.customerRequest}</p>
                <b>Additional accessories</b>
                <p>{ticket.accessories}</p>
                <b>Notes</b>
                <p>{ticket.notes}</p>
            </div>
        </div>
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
