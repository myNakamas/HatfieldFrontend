import { Ticket } from '../../models/interfaces/ticket'
import { Page, PageRequest } from '../../models/interfaces/generalModels'
import dateFormat from 'dateformat'
import { Statistic, Table } from 'antd'
import { NoDataComponent } from './NoDataComponent'
import moment from 'moment/moment'
import React from 'react'
import { ColumnsType } from 'antd/es/table'

function Deadline({ deadline }: { deadline: Date }) {
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
    onClick: (ticket: Ticket) => void
    page: PageRequest
    setPage: (page: PageRequest) => void
}) => {
    if (!data || data.content.length === 0) return <NoDataComponent items={'active tickets'} />
    const columns = ['creation date', 'deadline', 'status', 'client'].map((string, index) => ({
        title: string,
        dataIndex: string,
        key: index + string,
    })) as ColumnsType<Ticket>
    const getComponentProps = (record: Ticket) => ({
        onClick: () => {
            if (onClick) {
                onClick(record)
            }
        },
    })
    return (
        <Table
            dataSource={
                data.content.map(({ timestamp, deadline, client, status }) => ({
                    'creation date': dateFormat(timestamp),
                    deadline: deadline ? <Deadline deadline={deadline} /> : '-',
                    status,
                    client: client?.fullName,
                })) as unknown as Ticket[]
            }
            columns={columns}
            onRow={getComponentProps}
            rowClassName={({ deadline }: Ticket) => (moment(deadline).isBefore(moment.now()) ? 'dangerBg' : '')}
            pagination={{
                pageSize: page?.pageSize,
                current: page?.page,
                onChange: (page, pageSize) => setPage({ page, pageSize }),
                pageSizeOptions: [5, 10, 15],
                showSizeChanger: true,
            }}
        />
    )
}
