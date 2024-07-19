import { Ticket } from '../../../models/interfaces/ticket'
import React, { useEffect, useState } from 'react'
import { defaultPage } from '../../../models/enums/defaultValues'
import { LogsFilter } from '../../../models/interfaces/filters'
import { useQuery, useQueryClient } from 'react-query'
import { getAllLogs } from '../../../axios/http/shopRequests'
import { AppModal } from '../AppModal'
import {
    Alert,
    Button,
    Card,
    Col,
    Collapse,
    Descriptions,
    List,
    Popover,
    Result,
    Row,
    Space,
    Tag,
    Typography,
} from 'antd'
import { UserDescription } from '../users/ViewUser'
import DescriptionsItem from 'antd/lib/descriptions/Item'
import dateFormat from 'dateformat'
import { Deadline } from './Deadline'
import { Log } from '../../../models/interfaces/shop'
import { getProfilePicture } from '../../../axios/http/userRequests'
import ProfileImage from '../../user/ProfileImage'
import { currencyFormat } from '../../../utils/helperFunctions'
import { LogTypeText } from '../../../models/enums/logEnums'

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
    const queryClient = useQueryClient()
    useEffect(() => {
        queryClient.invalidateQueries(['logs', filter])
    }, [show])
    return (
        <AppModal title={'More details'} isModalOpen={show} closeModal={closeModal}>
            <Space direction={'vertical'} className={'w-100'}>
                {ticket.client && (
                    <Collapse
                        items={[
                            {
                                key: '1',
                                label: 'Client Details:',
                                showArrow: true,
                                children: <UserDescription user={ticket.client} />,
                            },
                        ]}
                    />
                )}

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
        <Space direction={'vertical'} className={'w-100'}>
            <Row gutter={4} wrap justify={'space-between'} className='w-100'>
                <Col flex='auto'>
                    <Card title={'Deadline'} size={'small'}>
                        <Deadline deadline={ticket.deadline} />
                    </Card>
                </Col>
                <Col flex='auto'>
                    {ticket.client ? (
                        <Card
                            title={'Client'}
                            size={'small'}
                            extra={
                                <Tag title='Client Username' color={ticket.client ? 'blue' : 'red'}>
                                    {ticket.client?.username}
                                </Tag>
                            }
                        >
                            <Typography>
                                Fullname:<b> {ticket.client?.fullName ?? '-'}</b>
                                <br />
                                Phones:<b> {ticket.client?.phones?.join(',\n') ?? '-'}</b>
                                <br />
                                Email:<b> {ticket.client?.email ?? '-'}</b>
                            </Typography>
                        </Card>
                    ) : (
                        <Tag color='red'>Missing client</Tag>
                    )}
                </Col>
                <Col flex='auto'>
                    <Card
                        size={'small'}
                        title={'Device brand & model'}
                        children={`${ticket.deviceBrand ?? ''}  ${ticket.deviceModel ?? ''}`}
                    />
                </Col>
                {(ticket.deposit || ticket.totalPrice) && (
                    <Col>
                        <Descriptions bordered size={'small'} layout='horizontal'>
                            {ticket.deposit && (
                                <DescriptionsItem
                                    span={2}
                                    label={'Deposit'}
                                    children={currencyFormat(ticket.deposit)}
                                />
                            )}
                            {ticket.totalPrice && (
                                <>
                                    <DescriptionsItem
                                        label={'Total price'}
                                        children={currencyFormat(ticket.totalPrice)}
                                    />
                                    <DescriptionsItem
                                        label={'Left to pay'}
                                        span={2}
                                        children={currencyFormat(ticket.totalPrice - (ticket.deposit ?? 0))}
                                    />
                                </>
                            )}
                        </Descriptions>
                    </Col>
                )}
                {ticket.devicePassword && (
                    <Col flex='auto'>
                        <Card size={'small'} title={'Password'} children={ticket.devicePassword} />
                    </Col>
                )}
            </Row>
            <Descriptions bordered layout={'vertical'} className={'w-100'}>
                {ticket.customerRequest?.length > 0 && (
                    <DescriptionsItem span={1} label={'Customer Request'} children={ticket.customerRequest} />
                )}
                {ticket.deviceCondition?.length > 0 && (
                    <DescriptionsItem span={1} label={'Device condition'} children={ticket.deviceCondition} />
                )}
                {ticket.problemExplanation && (
                    <DescriptionsItem span={3} label={'Problem explanation'} children={ticket.problemExplanation} />
                )}
                {ticket.notes?.length > 0 && <DescriptionsItem span={1} label={'Notes'} children={ticket.notes} />}
            </Descriptions>
        </Space>
    )
}

export const LogListRow = ({ log, onClick }: { log: Log; onClick?: (log: Log) => void }) => {
    const [open, setOpen] = useState(false)

    const logMessages = log.action.split(';')
    const header = logMessages.shift()
    const { data: profileImg, isLoading } = useQuery(
        ['profileImg', log?.user?.userId],
        () => getProfilePicture({ id: log?.user.userId }),
        { retry: false, retryOnMount: false }
    )
    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            style={{ width: 'fit-content' }}
            title={
                <Space className={'justify-between w-100'}>
                    <Space>{header}</Space>
                </Space>
            }
            content={
                <Space direction='vertical'>
                    <ul key={`logListItemContent${log.id}`}>
                        {logMessages.map((value, index) => {
                            return value.length == 0 ? (
                                <div key={`logMessage.${log.id}.${index}`}></div>
                            ) : (
                                <Typography.Paragraph
                                    ellipsis={{ rows: 3 }}
                                    prefix={'-'}
                                    key={`logMessage.${log.id}.${index}`}
                                >
                                    {value}
                                </Typography.Paragraph>
                            )
                        })}
                    </ul>
                    <Button
                        onClick={() => {
                            setOpen(false)
                            onClick && onClick(log)
                        }}
                    >
                        Show details
                    </Button>
                </Space>
            }
        >
            <List.Item className='list-item' about={dateFormat(log.timestamp)}>
                <List.Item.Meta
                    avatar={<ProfileImage profileImg={profileImg} isLoading={isLoading} />}
                    title={
                        <div className='w-100'>
                            {log.user?.fullName.trim().length > 0 ? log.user?.fullName : log.user?.username}
                        </div>
                    }
                    description={
                        <div>
                            <span className='date'>[{dateFormat(log.timestamp)}]</span> {LogTypeText[log.type]}
                        </div>
                    }
                />
            </List.Item>
        </Popover>
    )
}
