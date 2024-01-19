import { Ticket } from '../../models/interfaces/ticket'
import dateFormat from 'dateformat'
import { Button, Space, Statistic, Table } from 'antd'
import { NoDataComponent } from './NoDataComponent'
import moment from 'moment/moment'
import React, { useState } from 'react'
import { ColumnsType } from 'antd/es/table'
import { AddTicketInvoice } from '../modals/AddTicketInvoice'
import { PageRequest } from '../../models/interfaces/generalModels'
import { defaultPageSizeOptions } from '../../models/enums/defaultValues'

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
    data?: Ticket[]
    onClick: (ticket: Ticket) => void
    page: PageRequest
    setPage: (value: PageRequest) => void
}) => {
    if (!data || data.length === 0) return <NoDataComponent items={'tickets'} />
    const [collectTicket, setCollectTicket] = useState<Ticket | undefined>()
    const columns = ['id', 'creation date', 'due', 'status', 'client', 'actions'].map((string, index) => ({
        title: string,
        dataIndex: string,
        key: 'column' + index + string,
    })) as ColumnsType<Ticket>
    const getComponentProps = (record: Ticket): React.TdHTMLAttributes<any> => ({
        className: 'clickable-table-row',
        onClick: (e) => {
            if (e.target instanceof HTMLTableCellElement) {
                onClick(record)
            }
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
                    data.map((ticket, index) => ({
                        key: 'ticket' + index,
                        'creation date': dateFormat(ticket.timestamp),
                        due: ticket.deadline ? <Deadline deadline={ticket.deadline} /> : '-',
                        ...ticket,
                        client: ticket.client?.fullName,
                        actions: (
                            <Space>
                                <Button onClick={() => setCollectTicket(ticket)}>Collect</Button>
                            </Space>
                        ),
                    })) as unknown as Ticket[]
                }
                columns={columns}
                onRow={getComponentProps}
                pagination={{
                    pageSize: page.pageSize,
                    pageSizeOptions: defaultPageSizeOptions,
                    current: page.page,
                    onChange: (page, pageSize) => setPage({ page, pageSize }),
                }}
                scroll={{ x: true, scrollToFirstRowOnChange: true }}
                rowClassName={({ deadline }: Ticket) => (moment(deadline).isBefore(moment()) ? 'dangerBg' : '')}
            />
        </>
    )
}
