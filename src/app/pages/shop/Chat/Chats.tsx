import React, { useContext, useEffect, useState } from 'react'
import { sendMessageSeen } from '../../../axios/websocket/chat'
import { Chat, ChatMessage } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import { fetchTicketById, getChat, getClientChat } from '../../../axios/http/ticketRequests'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { sortChatByDate } from '../../../utils/helperFunctions'
import { TicketChatInfo } from './ChatTicketDetails'
import { ChatMessages } from './ChatMessages'
import { MessageInputField } from './ChatInputField'
import { TicketFilter } from '../../../models/interfaces/filters'
import { Page, PageRequest } from '../../../models/interfaces/generalModels'
import { appGetNextPageParam, appGetPreviousPageParam } from '../../../axios/reactQueryProps'
import { ChatDrawer } from './ChatDrawer'

const InfiniteScrollPageSize = 20

export const Chats = () => {
    const { loggedUser, isClient } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>({ hideCompleted: false, shopId: loggedUser?.shopId })
    const fetchChat = isClient() ? getClientChat : getChat
    const navigate = useNavigate()
    const [page, setPage] = useState<PageRequest>({ page: 1, pageSize: InfiniteScrollPageSize })
    const { userChats, setUserChats } = useContext(WebSocketContext)
    const [chat, setChat] = useState<Chat | undefined>()
    const [params] = useSearchParams()
    const [selectedTicketId, setSelectedTicketId] = useState<number | undefined>(Number(params.get('id')) ?? undefined)
    const queryClient = useQueryClient()
    const { data: selectedTicket } = useQuery(['ticket', selectedTicketId], () => fetchTicketById(selectedTicketId), {
        enabled: !!selectedTicketId,
    })
    const [ticketDrawer, setTicketDrawer] = useState(!selectedTicket)

    const {
        data: oldMessages,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery<Page<ChatMessage>, PageRequest>(
        ['messages', selectedTicket?.id],
        ({ pageParam = 1 }) =>
            fetchChat({
                ticketId: selectedTicket?.id,
                page: pageParam,
                pageSize: InfiniteScrollPageSize,
            }),
        {
            getNextPageParam: appGetNextPageParam,
            getPreviousPageParam: appGetPreviousPageParam,
            onSuccess: ({ pages: [page] }) => {
                if (selectedTicket?.id) {
                    setUserChats((prev) => {
                        prev[selectedTicket.id] = []
                        return { ...prev }
                    })
                }
                queryClient.invalidateQueries(['messages', 'missed'])
            },
        }
    )
    useEffect(() => {
        if (selectedTicket) {
            navigate({ search: 'id=' + selectedTicket.id }, { replace: true })
            let userMessages = selectedTicket?.id ? userChats[selectedTicket.id] ?? [] : []
            const messagesByUser = [
                ...(oldMessages?.pages.flatMap((page) => page.content) ?? []),
                ...userMessages,
            ].sort(sortChatByDate)
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
                <ChatMessages
                    openDrawer={() => setTicketDrawer((prev) => !prev)}
                    {...{ selectedTicket, chat, page, setPage, hasNextPage }}
                    fetchNextPage={(page) => {
                        fetchNextPage({ pageParam: page.page }).then()
                        setPage(page)
                    }}
                />
                <MessageInputField selectedTicket={selectedTicket} />
            </div>
            <ChatDrawer
                {...{
                    ticketDrawer,
                    setTicketDrawer,
                    filter,
                    setFilter,
                    setSelectedTicketId,
                    selectedTicket,
                }}
            />
        </div>
    )
}
