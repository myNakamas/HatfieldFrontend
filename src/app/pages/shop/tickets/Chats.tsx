import { stompClient } from '../../../axios/websocketClient'
import React, { useContext, useEffect, useState } from 'react'
import { Discuss } from 'react-loader-spinner'
import { sendMessage, sendMessageSeen } from '../../../axios/websocket/chat'
import { Chat, ChatMessage, CreateChatMessage, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { useQuery } from 'react-query'
import { getAllUsers, getProfilePicture } from '../../../axios/http/userRequests'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import { fetchAllTickets, fetchChat } from '../../../axios/http/ticketRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane'
import dateFormat from 'dateformat'
import { faArrowRight, faCheckDouble, faCircleCheck, faFileUpload, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { dateTimeMask } from '../../../models/enums/appEnums'
import { Button, Card, Descriptions, Drawer, Menu, Modal, Skeleton, Space, Upload, UploadFile, UploadProps } from 'antd'
import { ViewTicket } from '../../../components/modals/ticket/ViewTicket'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProfileImage } from '../../../components/user/ProfileImage'
import { getBase64, getCurrentTime, sortChatByDate } from '../../../utils/helperFunctions'
import { RcFile } from 'antd/es/upload'

export const Chats = () => {
    const page = { page: 0, pageSize: 10 }
    const { loggedUser } = useContext(AuthContext)

    const navigate = useNavigate()
    const { userChats, setUserChats } = useContext(WebSocketContext)
    const { data: tickets } = useQuery(['tickets', page], () => fetchAllTickets({ page, filter: {} }))
    const [chat, setChat] = useState<Chat | undefined>()
    const [params] = useSearchParams()
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>(
        tickets?.content.find((ticket) => String(ticket.id) === params.get('id'))
    )
    const [ticketDrawer, setTicketDrawer] = useState(!selectedTicket)

    const { data: oldMessages } = useQuery(
        ['messages', selectedTicket?.id],
        () => fetchChat({ ticketId: selectedTicket?.id }),
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

const ChatMessages = ({
    selectedTicket,
    chat,
    openDrawer,
}: {
    openDrawer: () => void
    selectedTicket?: Ticket
    chat?: Chat
}) => {
    const { data: users } = useQuery(['users'], () => getAllUsers({}))

    return (
        <div className='chatBox'>
            {stompClient.connected && selectedTicket && chat?.chat ? (
                <>
                    {chat?.chat.map((value, index) => {
                        const user = users?.find((user) => user.userId === value.sender)
                        return <ChatMessageRow sender={user} key={index} message={value} />
                    })}
                </>
            ) : selectedTicket?.id ? (
                <div className='w-100'>
                    <Discuss />
                    Loading messages
                </div>
            ) : (
                <div onClick={openDrawer} className={'w-100'}>
                    <FontAwesomeIcon icon={faArrowRight} size={'xl'} />
                    <h4>Please select a ticket to see its chat</h4>
                </div>
            )}
        </div>
    )
}

const TicketChatInfo = ({ ticket, openDrawer }: { ticket: Ticket | undefined; openDrawer: () => void }) => {
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
                <ViewTicket ticket={showModal ? ticket : undefined} closeModal={() => setShowModal(false)} />
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

const ChatMessageRow = ({ message, sender }: { message: ChatMessage; sender?: User }) => {
    const { loggedUser } = useContext(AuthContext)
    const isSenderLoggedUser = message.sender === loggedUser?.userId
    const { data: profileImg } = useQuery(
        ['profileImg', sender?.userId],
        () => getProfilePicture({ id: sender?.userId }),
        { retry: false }
    )

    const getMessageStatusIcon = () => {
        if (!isSenderLoggedUser) return <></>
        if (message.status === 'NotSent')
            return <FontAwesomeIcon className='statusIcon' icon={faSpinner} title={'Sending'} />
        if (message.readByReceiver)
            return (
                <FontAwesomeIcon
                    className='statusIcon'
                    icon={faCheckDouble}
                    title={'Seen at ' + dateFormat(message.readByReceiver)}
                />
            )
        return <FontAwesomeIcon className='statusIcon' icon={faCircleCheck} title={'Sent'} />
    }

    const Icon = getMessageStatusIcon()

    return (
        <div className={isSenderLoggedUser ? 'message-sender' : 'message-receiver'}>
            <div className='message-wrapper'>
                <div className='message' title={sender?.fullName + '\n' + dateFormat(message.timestamp)}>
                    {message.text}
                </div>
                <ProfileImage profileImg={profileImg} />
                {Icon}
            </div>
        </div>
    )
}

const MessageInputField = ({ selectedTicket: ticket }: { selectedTicket?: Ticket }) => {
    const { loggedUser } = useContext(AuthContext)
    const [messageText, setMessageText] = useState('')
    const { addUnsentMessage, removeUnsentMessage } = useContext(WebSocketContext)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState('')
    const [previewTitle, setPreviewTitle] = useState('')
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const handleCancel = () => setPreviewOpen(false)

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile)
        }

        setPreviewImage(file.url || (file.preview as string))
        setPreviewOpen(true)
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1))
    }

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList)

    const send = () => {
        if (loggedUser && ticket && messageText.trim().length > 0) {
            const randomId = Math.floor(Math.random() * 1000000)
            const receiver =
                loggedUser.userId !== ticket?.client?.userId ? ticket?.client?.userId : ticket.createdBy.userId
            setMessageText('')
            const message: CreateChatMessage = {
                timestamp: getCurrentTime(),
                sender: loggedUser.userId,
                text: messageText,
                ticketId: ticket.id,
                receiver,
                randomId: randomId,
            }
            addUnsentMessage(message)
            sendMessage(message).then(() => {
                removeUnsentMessage({ status: 'Sent', ...message } as ChatMessage)
            })
        }
    }
    const sendPicture = () => {
        console.log(fileList)
    }
    return (
        <div className='messageField'>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt='example' style={{ width: '100%' }} src={previewImage} />
            </Modal>
            <Upload
                className='upload-list-inline'
                listType='text'
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                onRemove={(file) => {
                    const index = fileList.indexOf(file)
                    const newFileList = fileList.slice()
                    newFileList.splice(index, 1)
                    setFileList(newFileList)
                }}
                beforeUpload={(file) => {
                    setFileList([...fileList, file])

                    return false
                }}
            >
                <Button icon={<FontAwesomeIcon icon={faFileUpload} />} />
            </Upload>
            {fileList.length === 0 && (
                <input
                    className='input'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    aria-autocomplete='none'
                    disabled={ticket?.id === undefined}
                    autoFocus
                />
            )}
            <Button
                type='primary'
                className={`sendButton`}
                disabled={!stompClient.connected || !ticket?.id}
                onClick={fileList.length === 0 ? send : sendPicture}
                icon={<FontAwesomeIcon color='white' size='lg' icon={faPaperPlane} />}
            />
        </div>
    )
}
