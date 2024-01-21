import { useContext } from 'react'
import { WebSocketContext } from '../contexts/WebSocketContext'
import { Badge } from 'antd'
import { BadgeProps } from 'antd/lib'

export const ChatBadge = ({ ticketId, ...props }: { ticketId: number } & BadgeProps) => {
    const { notificationCount } = useContext(WebSocketContext)

    return <Badge {...props} count={notificationCount.countPerTicket[ticketId]} overflowCount={9} />
}
