import { stompClient } from '../../../axios/websocketClient'
import { useContext, useEffect, useState } from 'react'
import { Discuss } from 'react-loader-spinner'
import { sendMessage, sendMessageSeen } from '../../../axios/websocket/chat'
import { Chat, ChatMessage, CreateChatMessage } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { useQuery } from 'react-query'
import { getAllUsers } from '../../../axios/http/userRequests'
import { MenuHeader } from '@szhsin/react-menu'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import { fetchChat } from '../../../axios/http/ticketRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane'
import dateFormat from 'dateformat'
import { faArrowRight, faCheckDouble, faCircleCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'

export const Chats = () => {
    const { loggedUser } = useContext(AuthContext)
    const [selectedReceiver, setSelectedReceiver] = useState<User>()
    const { data: users } = useQuery(['users'], () => getAllUsers({}))
    // const { data: tasks } = useQuery('tasks', fetchAllTickets)

    const { userChats, setUserChats, unsentMessages, setUnsentMessages } = useContext(WebSocketContext)
    const [chat, setChat] = useState<Chat | undefined>()
    const { data: oldMessages } = useQuery(
        ['messages', selectedReceiver?.userId],
        () => fetchChat({ userId: selectedReceiver?.userId ?? '' }),
        {
            enabled: !!selectedReceiver?.userId,
            onSuccess: (data) => {
                if (selectedReceiver?.userId) {
                    setUserChats((prevState) => {
                        prevState[selectedReceiver?.userId] = []
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
        if (selectedReceiver) {
            const userMessages = userChats[selectedReceiver.userId] ?? []
            const old = oldMessages ?? []
            const messagesByUser = [...old, ...userMessages, ...unsentMessages].sort(
                (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
            )
            const receiver = users?.find((user) => user.userId === selectedReceiver.userId)
            setChat({ chat: messagesByUser, receiver, sender: loggedUser } as Chat)
        }
    }, [selectedReceiver, userChats, unsentMessages, oldMessages])

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
                <div className='chatBox'>
                    <div className='messageField'>
                        <input
                            className='input'
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' &&
                                loggedUser &&
                                selectedReceiver &&
                                messageText.trim().length > 0 &&
                                send(messageText, loggedUser, selectedReceiver)
                            }
                            aria-autocomplete='none'
                            disabled={!selectedReceiver?.userId}
                            autoFocus
                        />
                        <button
                            className={`sendButton icon-s ${selectedReceiver?.userId && 'clickable'}`}
                            disabled={!stompClient.connected || !selectedReceiver?.userId}
                            onClick={() =>
                                loggedUser && selectedReceiver && send(messageText, loggedUser, selectedReceiver)
                            }
                        >
                            <FontAwesomeIcon size='lg' icon={faPaperPlane} />
                        </button>
                    </div>
                    {stompClient.connected && selectedReceiver?.userId ? (
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
                    ) : selectedReceiver?.userId ? (
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
                <div className='ticketChatContainer'>
                    {users &&
                        users?.map((user, index) => (
                            <div key={'user' + index} className='clickable ' onClick={() => setSelectedReceiver(user)}>
                                <MenuHeader className='menu '>
                                    <div className='username'>{user?.username}</div>
                                    <div className='role'>{user?.role}</div>
                                </MenuHeader>
                            </div>
                        ))}
                </div>
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
