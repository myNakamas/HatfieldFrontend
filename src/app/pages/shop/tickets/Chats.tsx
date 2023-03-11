import { stompClient } from '../../../axios/websocketClient'
import { useContext, useEffect, useState } from 'react'
import { Discuss } from 'react-loader-spinner'
import { sendMessage } from '../../../axios/websocket/chat'
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

export const Chats = () => {
    const { loggedUser } = useContext(AuthContext)
    const [selectedReceiver, setSelectedReceiver] = useState<User>()
    const { data: users } = useQuery('users', getAllUsers)
    // const { data: tasks } = useQuery('tasks', fetchAllTickets)

    const { messages, setMessages } = useContext(WebSocketContext)
    const [chat, setChat] = useState<Chat | undefined>()
    useQuery(['messages', selectedReceiver?.userId], () => fetchChat({ userId: selectedReceiver?.userId ?? '' }), {
        enabled: !!selectedReceiver?.userId,
        onSuccess: (data) => {
            if (selectedReceiver?.userId) {
                setMessages((prevState) => {
                    prevState[selectedReceiver?.userId] = data
                    return { ...prevState }
                })
            }
        },
    })
    const [messageText, setMessageText] = useState('...')

    useEffect(() => {
        if (selectedReceiver) {
            const userMessages = messages[selectedReceiver.userId]
            if (userMessages) {
                const messagesByUser = [...userMessages.received, ...userMessages.sent].sort(
                    (a, b) => +new Date(a.timestamp) - +new Date(b.timestamp)
                )
                const receiver = users?.find((user) => user.userId === selectedReceiver.userId)
                setChat({ chat: messagesByUser, receiver, sender: loggedUser } as Chat)
            }
        }
    }, [selectedReceiver, messages])

    const send = async (messageText: string, loggedUser: User, selectedReceiver: User) => {
        const message: CreateChatMessage = {
            timestamp: new Date(),
            sender: loggedUser.userId,
            text: messageText,
            ticketId: 1,
            receiver: selectedReceiver?.userId,
        }
        await sendMessage(message)
    }
    // const closeConnection = () => {
    //     stompClient.deactivate().then()
    // }

    return (
        <div className='mainScreen'>
            <div className='flex-100'>
                <div className='chatBox'>
                    {stompClient.connected && selectedReceiver?.userId ? (
                        <div className='w-100'>
                            {chat?.chat.map((value, index, array) => (
                                <ChatMessageRow
                                    receiver={chat?.receiver}
                                    sender={chat?.sender}
                                    key={index}
                                    message={value}
                                    showUser={!array[index - 1] || array[index - 1].receiver != value.receiver}
                                />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className='w-100'>
                                <Discuss />
                            </div>
                            Loading messages
                        </>
                    )}
                    <div className='messageField'>
                        <input className='input' value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                        <button
                            className='sendButton icon-s clickable'
                            disabled={!stompClient.connected}
                            onClick={() =>
                                loggedUser && selectedReceiver && send(messageText, loggedUser, selectedReceiver)
                            }
                        >
                            <FontAwesomeIcon size='lg' icon={faPaperPlane} />
                        </button>
                    </div>
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
    sender,
    receiver,
}: {
    message: ChatMessage
    showUser: boolean
    receiver?: User
    sender?: User
}) => {
    const { loggedUser } = useContext(AuthContext)
    const isSenderLoggedUser = message.sender === loggedUser?.userId
    const user = isSenderLoggedUser ? sender : receiver
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
                    <div className='message'>{message.text}</div>
                </div>
            </div>
        </>
    )
}
