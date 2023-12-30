import { stompClient } from '../../../axios/websocketClient'
import React, { Suspense, useContext } from 'react'
import { Chat, ChatMessage, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { useQuery } from 'react-query'
import { getProfilePicture, getSimpleUsers } from '../../../axios/http/userRequests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import dateFormat from 'dateformat'
import { faArrowRight, faCheckDouble, faCircleCheck, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Alert, Divider, Image, Skeleton, Spin } from 'antd'
import ProfileImage from '../../../components/user/ProfileImage'
import { getImage } from '../../../axios/http/resourcesRequests'
import InfiniteScroll from 'react-infinite-scroll-component'
import { PageRequest } from '../../../models/interfaces/generalModels'

export const ChatMessages = ({
    selectedTicket,
    chat,
    openDrawer,
    page,
    hasNextPage,
    fetchNextPage,
}: {
    openDrawer: () => void
    selectedTicket?: Ticket
    chat?: Chat
    page: PageRequest
    hasNextPage?: boolean
    fetchNextPage: (page: PageRequest) => void
}) => {
    const { data: users } = useQuery(['users'], () => getSimpleUsers({}))
    const loadMoreData = () => {
        if (hasNextPage) {
            fetchNextPage({ ...page, page: page.page + 1 })
        }
    }
    return (
        <div className={'chatBox'} id={'scrollChatBox'}>
            {stompClient.connected && selectedTicket && chat?.chat ? (
                <InfiniteScroll
                    inverse
                    className={'chatBox'}
                    dataLength={chat?.chat.length}
                    next={loadMoreData}
                    hasMore={hasNextPage ?? false}
                    loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                    endMessage={<Divider plain>No more messages 🤐</Divider>}
                    scrollableTarget={'scrollChatBox'}
                >
                    {chat.chat.map((value, index) => {
                        const user = users?.find((user) => user.userId === value.sender)
                        return <ChatMessageRow sender={user} key={index} message={value} />
                    })}
                </InfiniteScroll>
            ) : selectedTicket?.id ? (
                <div className='w-100'>
                    <Skeleton active />
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
        { retry: false, retryOnMount: false }
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
                        <div className={'message'}>
                            <ChatImage url={message.text} />
                        </div>
                    </Suspense>
                ) : (
                    <div
                        className='message'
                        title={sender?.fullName ?? sender?.username + '\n' + dateFormat(message.timestamp)}
                    >
                        {message.text}
                    </div>
                )}

                <ProfileImage className={'chatProfileIcon'} profileImg={profileImg} />
                {Icon}
            </div>
        </div>
    )
}

const ChatImage = ({ url }: { url: string }) => {
    const { data: image } = useQuery(['image', url], () => getImage(url), { suspense: true, retry: false })
    return image && image.size > 0 ? (
        <Image wrapperClassName='message-image' src={URL.createObjectURL(image)} width={300} height={300} />
    ) : (
        <Alert
            type='error'
            message='Missing image'
            showIcon
            description='The image has been corrupted or deleted'
        ></Alert>
    )
}
