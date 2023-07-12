import { Ticket } from '../../models/interfaces/ticket'
import dateFormat from 'dateformat'
import { Button, Space, Statistic, Table } from 'antd'
import { NoDataComponent } from './NoDataComponent'
import moment from 'moment/moment'
import React, { useState } from 'react'
import { ColumnsType } from 'antd/es/table'
import { AddTicketInvoice } from '../modals/AddTicketInvoice'
import { Page, PageRequest } from '../../models/interfaces/generalModels'
import { setDefaultPageSize } from '../../models/enums/defaultValues'
import { useNavigate } from 'react-router-dom'

const Deadline = ({ deadline }: { deadline: Date }) => {
    const { Countdown } = Statistic

    return <Countdown title={dateFormat(deadline)} value={deadline.valueOf()} />
}

export const ShortTicketTable = ({
    data,
    onClick,
    page,
    setPage,
}: {
    data?: Page<Ticket>
    page: PageRequest
    setPage: (page: PageRequest) => void
    onClick: (ticket: Ticket) => void
}) => {
    const navigate = useNavigate()
    if (!data || data.content?.length === 0) return <NoDataComponent items={'active tickets'} />
    const [collectTicket, setCollectTicket] = useState<Ticket | undefined>()
    const columns = ['creation date', 'due', 'status', 'client', 'actions'].map((string, index) => ({
        title: string,
        dataIndex: string,
        key: 'column' + index + string,
    })) as ColumnsType<Ticket>
    const getComponentProps = (record: Ticket) => ({
        onDoubleClick: () => {
            onClick(record)
        },
    })

    return (
        <>
            <AddTicketInvoice
                ticket={collectTicket}
                closeModal={() => setCollectTicket(undefined)}
                isModalOpen={!!collectTicket}
            />
            <Table
                dataSource={
                    data.content?.map((ticket, index) => ({
                        key: 'ticket' + index,
                        'creation date': dateFormat(ticket.timestamp),
                        due: ticket.deadline ? <Deadline deadline={ticket.deadline} /> : '-',
                        ...ticket,
                        client: ticket.client?.fullName,
                        actions: (
                            <Space>
                                isClientView?
                                <Button
                                    onClick={() => navigate('/chats?id=' + ticket.id)}
                                    children={ticket.status !== 'COLLECTED' ? 'Open chat' : 'I have a problem'}
                                />
                                :<Button onClick={() => setCollectTicket(ticket)}>Collect</Button>
                            </Space>
                        ),
                    })) as unknown as Ticket[]
                }
                columns={columns}
                onRow={getComponentProps}
                pagination={{
                    defaultPageSize: 10,
                    defaultCurrent: 1,
                    pageSize: page?.pageSize,
                    current: page?.page,
                    onChange: (page, pageSize) => {
                        setDefaultPageSize(pageSize)
                        setPage({ page, pageSize })
                    },
                    pageSizeOptions: [5, 10, 15, 20, 50, 100],
                    position: ['topRight', 'bottomRight'],
                    showSizeChanger: true,
                    total: data.totalCount,
                }}
                scroll={{ x: true, scrollToFirstRowOnChange: true }}
                rowClassName={({ deadline }: Ticket) => (moment(deadline).isBefore(moment()) ? 'dangerBg' : '')}
            />
        </>
    )
}
