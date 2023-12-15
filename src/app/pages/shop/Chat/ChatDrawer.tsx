import { Badge, Drawer, Menu, Space } from 'antd'
import CheckableTag from 'antd/es/tag/CheckableTag'
import { NoDataComponent } from '../../../components/table/NoDataComponent'
import { useContext } from 'react'
import { useQuery } from 'react-query'
import { fetchAllActiveTickets, fetchClientActiveTickets } from '../../../axios/http/ticketRequests'
import { activeTicketStatuses, completedTicketStatuses } from '../../../models/enums/ticketEnums'
import { TicketFilter } from '../../../models/interfaces/filters'
import { AuthContext } from '../../../contexts/AuthContext'
import { Ticket } from '../../../models/interfaces/ticket'
import { CustomSuspense } from '../../../components/CustomSuspense'
import { WebSocketContext } from '../../../contexts/WebSocketContext'

export const ChatDrawer = ({
    filter,
    setFilter,
    ticketDrawer,
    setTicketDrawer,
    selectedTicket,
    setSelectedTicketId,
}: {
    filter: TicketFilter
    setFilter: (filter: (filter: TicketFilter) => TicketFilter) => void
    ticketDrawer: boolean
    setTicketDrawer: (value: boolean) => void
    selectedTicket?: Ticket
    setSelectedTicketId: (value: number) => void
}) => {
    const { isClient } = useContext(AuthContext)
    const { notificationCount } = useContext(WebSocketContext)

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
            <Drawer
                title='Tickets'
                placement={'right'}
                closable={true}
                styles={{ body: { padding: 0 } }}
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
                                setSelectedTicketId(+item.key)
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
        </CustomSuspense>
    )
}
