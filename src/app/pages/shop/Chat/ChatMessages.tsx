import { stompClient } from '../../../axios/websocketClient'
import React, { Suspense, useContext } from 'react'
import { Discuss } from 'react-loader-spinner'
import { Chat, ChatMessage, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { useQuery } from 'react-query'
import { getAllUsers, getProfilePicture } from '../../../axios/http/userRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dateFormat from 'dateformat'
import { faArrowRight, faCheckDouble, faCircleCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Image, Spin } from 'antd'
import { ProfileImage } from '../../../components/user/ProfileImage'
import { getImage } from '../../../axios/http/resourcesRequests'

export const ChatMessages = ({
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
                {message.isImage ? (
                    <Suspense fallback={<Spin />}>
                        <ChatImage url={message.text} />
                    </Suspense>
                ) : (
                    <div className='message' title={sender?.fullName + '\n' + dateFormat(message.timestamp)}>
                        {message.text}
                    </div>
                )}

                <ProfileImage className={'chatProfileIcon'} profileImg={profileImg} />
                {Icon}
            </div>
        </div>
    )
}

function ChatImage({ url }: { url: string }) {
    const { data: image } = useQuery(['image', url], () => getImage(url), { suspense: true })
    return image ? <Image className={'message'} src={URL.createObjectURL(image)} width={300} height={300} /> : <></>
}
