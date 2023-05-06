import { useQuery } from 'react-query'
import { fetchTicketById } from '../../axios/http/ticketRequests'
import { Log } from '../../models/interfaces/shop'
import { AppModal } from './AppModal'
import { Collapse, Descriptions } from 'antd'
import { TicketDescription } from './ticket/ViewTicket'
import { UserDescription } from './users/ViewUser'
import CollapsePanel from 'antd/es/collapse/CollapsePanel'
import dateFormat from 'dateformat'
import React from 'react'
import { ItemDescriptions } from './inventory/ViewInventoryItem'
import { fetchItemById } from '../../axios/http/shopRequests'

export const LogDetails = ({
    log,
    isModalOpen,
    closeModal,
}: {
    log?: Log
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const { data: ticket } = useQuery(['ticket', log?.ticketId], () => fetchTicketById(log?.ticketId ?? -1), {
        enabled: !!log?.ticketId,
    })
    const { data: item } = useQuery(['item', log?.itemId], () => fetchItemById({ id: log?.itemId }), {
        enabled: !!log?.itemId,
    })
    if (!log) return <></>
    return (
        <AppModal {...{ isModalOpen, closeModal }} title={`Log#${log.id} details`}>
            <Descriptions bordered layout='vertical' className='p-2'>
                <Descriptions.Item label={'Message'}>{log.action}</Descriptions.Item>
                <Descriptions.Item label={'Created at'}>{dateFormat(log.timestamp)}</Descriptions.Item>
            </Descriptions>
            <Collapse>
                {log.user && (
                    <CollapsePanel
                        key='1'
                        header={`User: ${log.user?.fullName} ${log.user?.email} ${log.user?.phones.join(', ')}`}
                        showArrow
                    >
                        <UserDescription user={log.user} />
                    </CollapsePanel>
                )}
                {ticket && (
                    <CollapsePanel key='2' header={`Ticket#${ticket.id} info`} showArrow>
                        <TicketDescription ticket={ticket} />
                    </CollapsePanel>
                )}
                {item && (
                    <CollapsePanel key='3' header={`Item ${item?.name} info`} showArrow>
                        <ItemDescriptions inventoryItem={item} />
                    </CollapsePanel>
                )}
            </Collapse>
        </AppModal>
    )
}
