import { useQuery } from 'react-query'
import { fetchTicketById } from '../../axios/http/ticketRequests'
import { Log } from '../../models/interfaces/shop'
import { AppModal } from './AppModal'
import { Collapse, Descriptions } from 'antd'
import { UserDescription } from './users/ViewUser'
import CollapsePanel from 'antd/es/collapse/CollapsePanel'
import dateFormat from 'dateformat'
import React, { ReactNode } from 'react'
import { ItemDescriptions } from './inventory/ViewInventoryItem'
import { fetchItemById } from '../../axios/http/shopRequests'
import { getInvoiceById } from '../../axios/http/invoiceRequests'
import { Invoice } from '../../models/interfaces/invoice'
import { Ticket } from '../../models/interfaces/ticket'
import { dateTimeMask } from '../../models/enums/appEnums'

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
    const { data: invoice } = useQuery(['invoice', log?.invoiceId], () => getInvoiceById(log?.invoiceId), {
        enabled: !!log?.invoiceId,
    })
    if (!log) return <></>
    return (
        <AppModal {...{ isModalOpen, closeModal }} title={`Log#${log.id} details`}>
            <Descriptions bordered layout='vertical' className='p-2'>
                <Descriptions.Item label={'Message'}>{log.action}</Descriptions.Item>
                <Descriptions.Item label={'Type'}>{log.type}</Descriptions.Item>
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
                        <ItemDescriptions inventoryItem={item} showCount />
                    </CollapsePanel>
                )}
                {invoice && (
                    <CollapsePanel key='4' header={`Invoice#${invoice.id} info`} showArrow>
                        <InvoiceDescriptions Invoice={invoice} />
                    </CollapsePanel>
                )}
            </Collapse>
        </AppModal>
    )
}

export const InvoiceDescriptions = ({ Invoice, extra }: { Invoice: Invoice; extra?: ReactNode }) => {
    return (
        <>
            <Descriptions size={'middle'} layout={'vertical'} column={4} bordered extra={extra}>
                <Descriptions.Item label={'Type'}>{Invoice.type}</Descriptions.Item>
                <Descriptions.Item label={'Price'}>{Invoice.totalPrice}</Descriptions.Item>
                <Descriptions.Item label={'Payment method'}>{Invoice.paymentMethod}</Descriptions.Item>
                <Descriptions.Item label={'Warranty period'}>{Invoice.warrantyPeriod}</Descriptions.Item>
            </Descriptions>
        </>
    )
}
export const TicketDescription = ({ ticket }: { ticket: Ticket }) => {
    return (
        <Descriptions bordered size='small' layout='vertical' title={`Ticket#${ticket.id} Info`}>
            <Descriptions.Item label='Created at'>{dateFormat(ticket.timestamp, dateTimeMask)}</Descriptions.Item>
            <Descriptions.Item label='Deadline'>{dateFormat(ticket.deadline, dateTimeMask)}</Descriptions.Item>
            <Descriptions.Item label='Status'>{ticket.status}</Descriptions.Item>
            <Descriptions.Item label='Location'>{ticket.deviceLocation}</Descriptions.Item>
            {ticket.client && (
                <Descriptions.Item label='Client'>
                    {ticket.client.fullName} {ticket.client.email}
                </Descriptions.Item>
            )}
            <Descriptions.Item label='Problem'>{ticket.problemExplanation}</Descriptions.Item>
            <Descriptions.Item label='Customer Request'>{ticket.customerRequest}</Descriptions.Item>
            <Descriptions.Item label='Created by'>{ticket.createdBy.fullName}</Descriptions.Item>
            <Descriptions.Item label='Payment'>
                {ticket.deposit && `Deposit: ${ticket.deposit?.toFixed(2)}`}
                <br />
                {ticket.totalPrice && `Total price: ${ticket.totalPrice?.toFixed(2)}`}
            </Descriptions.Item>
            <Descriptions.Item label='Notes'>{ticket.notes}</Descriptions.Item>

            <Descriptions.Item label='Device Info'>
                {ticket.deviceModel && (
                    <>
                        Device model: {ticket.deviceModel}
                        <br />
                    </>
                )}
                {ticket.deviceBrand && (
                    <>
                        Device brand: {ticket.deviceBrand} <br />
                    </>
                )}
                {ticket.deviceCondition && (
                    <>
                        Condition: {ticket.deviceCondition} <br />
                    </>
                )}
                {ticket.devicePassword && (
                    <>
                        Password: {ticket.devicePassword}
                        <br />
                    </>
                )}
                {ticket.serialNumberOrImei && (
                    <>
                        Serial number / Imei: {ticket.serialNumberOrImei}
                        <br />
                    </>
                )}
                {ticket.accessories && (
                    <>
                        Accessories: {ticket.accessories} <br />
                    </>
                )}
            </Descriptions.Item>
        </Descriptions>
    )
}
