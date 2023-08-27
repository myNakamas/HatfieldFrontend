import { Ticket } from '../../../models/interfaces/ticket'
import React, { useState } from 'react'
import { defaultPage } from '../../../models/enums/defaultValues'
import { LogsFilter } from '../../../models/interfaces/filters'
import { useQuery } from 'react-query'
import { getAllLogs } from '../../../axios/http/shopRequests'
import { AppModal } from '../AppModal'
import { Card, Collapse, Descriptions, List, Popover, Space } from 'antd'
import { UserDescription } from '../users/ViewUser'
import DescriptionsItem from 'antd/lib/descriptions/Item'
import dateFormat from 'dateformat'
import { Deadline } from './Deadline'
import { Log } from '../../../models/interfaces/shop'
import { getProfilePicture } from '../../../axios/http/userRequests'
import { ProfileImage } from '../../user/ProfileImage'
import { getUserString } from '../../../utils/helperFunctions'

export const DetailedTicketInfoView = ({
    ticket,
    show,
    closeModal,
}: {
    ticket: Ticket
    show: boolean
    closeModal: () => void
}) => {
    const [page, setPage] = useState(defaultPage)
    const filter: LogsFilter = { ticketId: ticket.id }
    const { data: logs } = useQuery(['logs', filter, page], () => getAllLogs({ filter, page }))

    return (
        <AppModal title={'More details'} isModalOpen={show} closeModal={closeModal}>
            <Space direction={'vertical'} className={'w-100'}>
                <Collapse
                    items={[
                        ticket.client && {
                            key: '1',
                            label: 'Client Details:',
                            showArrow: true,
                            children: <UserDescription user={ticket.client} />,
                        },
                    ]}
                />

                <Descriptions>
                    <DescriptionsItem label={'Created by'}>{ticket.createdBy.fullName}</DescriptionsItem>
                    <DescriptionsItem label={'At'}>{dateFormat(ticket.timestamp)}</DescriptionsItem>
                </Descriptions>
                <Descriptions title={'Device information'} bordered layout={'vertical'}>
                    {ticket.deviceModel && <DescriptionsItem label={'Model'}>{ticket.deviceModel}</DescriptionsItem>}
                    {ticket.deviceBrand && <DescriptionsItem label={'Brand'}>{ticket.deviceBrand}</DescriptionsItem>}
                    {ticket.deviceCondition && (
                        <DescriptionsItem label={'Condition'}>{ticket.deviceCondition}</DescriptionsItem>
                    )}
                    {ticket.devicePassword && (
                        <DescriptionsItem label={'Password'}>{ticket.devicePassword}</DescriptionsItem>
                    )}
                    {ticket.accessories && (
                        <DescriptionsItem label={'Accessories'}>{ticket.accessories}</DescriptionsItem>
                    )}
                </Descriptions>
                <div>
                    <List<Log>
                        header={'Activity'}
                        dataSource={logs?.content}
                        pagination={{
                            total: logs?.totalCount,
                            onChange: (page, pageSize) => setPage({ page, pageSize }),
                            position: 'bottom',
                        }}
                        renderItem={(log, index) => <LogListRow key={`logKey${log.id}.${index}`} log={log} />}
                    />
                </div>
            </Space>
        </AppModal>
    )
}

export const TicketModalDescription = ({ ticket }: { ticket: Ticket }) => {
    return (
        <Space direction={'vertical'}>
            <Space className={'justify-between w-100'}>
                <Space align={'start'}>
                    <Card title={'Deadline'} size={'small'}>
                        <Deadline deadline={ticket.deadline} />
                    </Card>
                    <Card
                        size={'small'}
                        title={'Device brand & model'}
                        children={`${ticket.deviceBrand ?? ''}  ${ticket.deviceModel ?? ''}`}
                    />
                </Space>
                {ticket.devicePassword && <Card size={'small'} title={'Password'} children={ticket.devicePassword} />}
            </Space>
            <Descriptions bordered layout={'vertical'} className={'w-100'}>
                <DescriptionsItem span={2} label={'Problem'} children={ticket.problemExplanation} />
                {ticket.customerRequest?.length > 0 && (
                    <DescriptionsItem span={1} label={'Customer Request'} children={ticket.customerRequest} />
                )}
                {ticket.notes?.length > 0 && <DescriptionsItem span={1} label={'Notes'} children={ticket.notes} />}
            </Descriptions>
        </Space>
    )
}

export const LogListRow = ({ log, onClick }: { log: Log; onClick?: (log: Log) => void }) => {
    const logMessages = log.action.split(';')
    const header = logMessages.shift()
    const { data: profileImg, isLoading } = useQuery(
        ['profileImg', log?.user?.userId],
        () => getProfilePicture({ id: log?.user.userId }),
        { retry: false }
    )
    return (
        <Popover
            style={{ width: 'fit-content' }}
            title={
                <Space className={'justify-between w-100'}>
                    <Space>{header}</Space>
                </Space>
            }
            content={
                <ul key={`logListItemContent${log.id}`}>
                    {logMessages.map((value, index) => {
                        return value.length == 0 ? (
                            <div key={`logMessage.${log.id}.${index}`}></div>
                        ) : (
                            <li key={`logMessage.${log.id}.${index}`}>{value}</li>
                        )
                    })}
                </ul>
            }
        >
            <List.Item onDoubleClick={() => onClick && onClick(log)} extra={dateFormat(log.timestamp)}>
                <List.Item.Meta
                    style={{ textAlign: 'left' }}
                    avatar={<ProfileImage profileImg={profileImg} isLoading={isLoading} />}
                    title={getUserString(log.user)}
                    description={log.type}
                />
            </List.Item>
        </Popover>
    )
}
