import { Ticket } from '../../models/interfaces/ticket'
import dateFormat from 'dateformat'
import { Button, Space, Statistic, Table } from 'antd'
import { NoDataComponent } from './NoDataComponent'
import moment from 'moment/moment'
import React, { useState } from 'react'
import { ColumnsType } from 'antd/es/table'
import { AddTicketInvoice } from '../modals/AddTicketInvoice'

const Deadline = ({ deadline }: { deadline: Date }) => {
    const { Countdown } = Statistic

    return <Countdown title={dateFormat(deadline)} value={deadline.valueOf()} />
}

export const ShortTicketTable = ({ data, onClick }: { data?: Ticket[]; onClick: (ticket: Ticket) => void }) => {
    if (!data || data.length === 0) return <NoDataComponent items={'active tickets'} />
    const [collectTicketId, setCollectTicketId] = useState<number | undefined>()
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
                ticketId={collectTicketId}
                closeModal={() => setCollectTicketId(undefined)}
                isModalOpen={!!collectTicketId}
            />
            <Table
                dataSource={
                    data.map(({ timestamp, deadline, client, status, ...rest }, index) => ({
                        key: 'ticket' + index,
                        'creation date': dateFormat(timestamp),
                        deadline: deadline,
                        due: deadline ? <Deadline deadline={deadline} /> : '-',
                        status,
                        client: client?.fullName,
                        ...rest,
                        actions: (
                            <Space>
                                <Button onClick={() => setCollectTicketId(rest.id)}>Collect</Button>
                            </Space>
                        ),
                    })) as unknown as Ticket[]
                }
                columns={columns}
                onRow={getComponentProps}
                pagination={false}
                scroll={{ x: true, scrollToFirstRowOnChange: true }}
                rowClassName={({ deadline }: Ticket) => (moment(deadline).isBefore(moment()) ? 'dangerBg' : '')}
            />
        </>
    )
}
