import { AppModal } from '../AppModal'
import {
    CreateTicket,
    createTicketFromTicket,
    CreateUsedItem,
    Ticket,
    UsedItemView,
} from '../../../models/interfaces/ticket'
import React, { useContext, useEffect, useState } from 'react'
import dateFormat from 'dateformat'
import { EditTicketForm } from './EditTicketForm'
import { putCompleteTicket, putFreezeTicket, putStartTicket, updateTicket } from '../../../axios/http/ticketRequests'
import { useQuery, useQueryClient } from 'react-query'
import CreatableSelect from 'react-select/creatable'
import { ItemPropertyView } from '../../../models/interfaces/generalModels'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { activeTicketStatuses, TicketStatus, TicketStatusesArray } from '../../../models/enums/ticketEnums'
import { toast } from 'react-toastify'
import { toastPrintTemplate, toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { Button, Card, Collapse, Descriptions, Pagination, Space, Timeline, Tooltip } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'
import { CustomTable } from '../../table/CustomTable'
import { NoDataComponent } from '../../table/NoDataComponent'
import { AddUsedItem } from './AddUsedItem'
import { useNavigate } from 'react-router-dom'
import { AddTicketInvoice } from '../AddTicketInvoice'
import Select from 'react-select'
import {
    getTicketImage,
    getTicketLabelImage,
    postPrintTicket,
    postPrintTicketLabel,
} from '../../../axios/http/documentRequests'
import { AuthContext } from '../../../contexts/AuthContext'
import { getAllDeviceLocations, getAllLogs } from '../../../axios/http/shopRequests'
import {
    faCheck,
    faEye,
    faFileInvoiceDollar,
    faHistory,
    faMessage,
    faPlay,
    faPlus,
    faSnowflake,
} from '@fortawesome/free-solid-svg-icons'
import { Deadline } from './Deadline'
import DescriptionsItem from 'antd/lib/descriptions/Item'
import { defaultPage } from '../../../models/enums/defaultValues'
import { LogsFilter } from '../../../models/interfaces/filters'
import CollapsePanel from 'antd/es/collapse/CollapsePanel'
import { UserDescription } from '../users/ViewUser'
import { FormField } from '../../form/Field'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'

const ViewTicketAllInfo = ({ ticket, show, closeModal }: { ticket: Ticket; show: boolean; closeModal: () => void }) => {
    const [page, setPage] = useState(defaultPage)
    const filter: LogsFilter = { ticketId: ticket.id }
    const { data: logs } = useQuery(['logs', filter, page], () => getAllLogs({ filter, page }))

    return (
        <AppModal title={'More details'} isModalOpen={show} closeModal={closeModal}>
            <Space direction={'vertical'} className={'w-100'}>
                <Collapse>
                    {ticket.client && (
                        <CollapsePanel key='1' header={`Client Details:`} showArrow>
                            <UserDescription user={ticket.client} />
                        </CollapsePanel>
                    )}
                </Collapse>
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
                </Descriptions>

                <Card title={'Activity'}>
                    <Timeline
                        mode={'alternate'}
                        items={logs?.content.map((log) => ({
                            label: <Tooltip title={dateFormat(log.timestamp)}>{log.action}</Tooltip>,
                            position: log.timestamp?.valueOf().toString(),
                        }))}
                    />
                    <Pagination total={logs?.totalCount} onChange={(page, pageSize) => setPage({ page, pageSize })} />
                </Card>
            </Space>
        </AppModal>
    )
}

export const ViewTicket = ({
    ticket,
    closeModal,
    view,
}: {
    ticket?: Ticket
    closeModal: () => void
    view?: string
}) => {
    const navigate = useNavigate()
    const [mode, setMode] = useState('view')
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)
    const [ticketLogOpen, setTicketLogOpen] = useState(false)
    const [isUseModalOpen, setIsUseModalOpen] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const queryClient = useQueryClient()
    const { isWorker } = useContext(AuthContext)
    useEffect(() => {
        if (view) setMode(view)
        else setMode('view')
    }, [view])

    const editTicket = (formValue: CreateTicket) => {
        if (!ticket?.id) {
            toast.error('Something went wrong, please try again', toastProps)
            return Promise.resolve()
        }
        return updateTicket({ id: ticket?.id, ticket: formValue }).then(() => {
            queryClient.invalidateQueries(['tickets']).then()
            setMode('view')
        })
    }

    const startTicket = (id: number) => {
        toast
            .promise(putStartTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['tickets']).then())
    }
    const freezeTicket = (id: number) => {
        toast
            .promise(putFreezeTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['tickets']).then())
    }

    const completeTicket = (id: number) => {
        toast
            .promise(putCompleteTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['tickets']).then(closeModal))
    }
    const updateTicketStatus = (id: number, ticketStatus: TicketStatus) => {
        return toast
            .promise(
                updateTicket({ id, ticket: { id, status: ticketStatus } as unknown as CreateTicket }),
                toastUpdatePromiseTemplate('ticket status'),
                toastProps
            )
            .then(() => queryClient.invalidateQueries(['tickets']))
    }

    const updateDeviceLocation = (id: number, deviceLocation?: string) => {
        if (deviceLocation) {
            toast
                .promise(
                    updateTicket({ id, ticket: { id, deviceLocation } as unknown as CreateTicket }),
                    toastUpdatePromiseTemplate('device location'),
                    toastProps
                )
                .then(() => queryClient.invalidateQueries(['tickets']))
        }
    }
    const printTicketLabel = () => {
        toast.promise(postPrintTicketLabel(ticket?.id), toastPrintTemplate, toastProps).then((blob) => {
            const fileUrl = URL.createObjectURL(blob)
            window.open(fileUrl)
        })
    }
    const previewTicketLabel = () => {
        toast.promise(getTicketLabelImage(ticket?.id), toastPrintTemplate, toastProps).then((blob) => {
            const fileUrl = URL.createObjectURL(blob)
            window.open(fileUrl)
        })
    }
    const printTicket = () => {
        toast.promise(postPrintTicket(ticket?.id), toastPrintTemplate, toastProps).then((blob) => {
            const fileUrl = URL.createObjectURL(blob)
            window.open(fileUrl)
        })
    }
    const previewTicket = () => {
        toast.promise(getTicketImage(ticket?.id), toastPrintTemplate, toastProps).then((blob) => {
            const fileUrl = URL.createObjectURL(blob)
            window.open(fileUrl)
        })
    }

    return (
        <AppModal
            isModalOpen={!!ticket}
            closeModal={() => {
                setMode('view')
                closeModal()
            }}
            title={`Ticket #${ticket?.id}`}
        >
            {ticket && (
                <>
                    <ViewTicketAllInfo
                        ticket={ticket}
                        closeModal={() => setTicketLogOpen(false)}
                        show={ticketLogOpen}
                    />
                    {isWorker() && (
                        <>
                            <AddUsedItem
                                usedItem={
                                    { itemId: undefined, count: 1, ticketId: ticket.id } as unknown as CreateUsedItem
                                }
                                closeModal={() => setIsUseModalOpen(false)}
                                show={isUseModalOpen}
                            />
                            <AddTicketInvoice
                                ticket={ticket}
                                closeModal={() => setShowInvoiceModal(false)}
                                isModalOpen={showInvoiceModal}
                            />
                        </>
                    )}
                    <div className='editModalButton '>
                        {mode !== 'edit' && isWorker() ? (
                            <Button
                                icon={<FontAwesomeIcon icon={faPenToSquare} size={'lg'} />}
                                onClick={() => setMode('edit')}
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                    {mode === 'edit' && (
                        <EditTicketForm
                            onComplete={editTicket}
                            ticket={createTicketFromTicket(ticket)}
                            onCancel={() => setMode('view')}
                        />
                    )}
                    {mode === 'view' && (
                        <div className='viewModal'>
                            <TicketModalDescription ticket={ticket} />
                            {isWorker() && (
                                <>
                                    <Card
                                        title='Used items'
                                        extra={
                                            <Button
                                                type='primary'
                                                icon={<FontAwesomeIcon icon={faPlus} />}
                                                disabled={!activeTicketStatuses.includes(ticket.status)}
                                                onClick={() => setIsUseModalOpen(true)}
                                            >
                                                Add an item from inventory
                                            </Button>
                                        }
                                    >
                                        {ticket.usedParts.length > 0 ? (
                                            <CustomTable<UsedItemView>
                                                data={ticket.usedParts.map(({ item, usedCount, timestamp }) => ({
                                                    item,
                                                    usedCount,
                                                    itemDetail: item.name,
                                                    timestamp: dateFormat(timestamp),
                                                }))}
                                                headers={{
                                                    itemDetail: 'item',
                                                    usedCount: 'Used count',
                                                    timestamp: 'Used at',
                                                }}
                                                //todo:Display Used item data
                                                onClick={() => {}}
                                            />
                                        ) : (
                                            <NoDataComponent items={'used items'} />
                                        )}
                                    </Card>
                                    <Space wrap className={'w-100 justify-between align-start'}>
                                        <Space direction={'vertical'} className='card'>
                                            <FormField label={'Change ticket status'}>
                                                <Select<ItemPropertyView, false>
                                                    theme={SelectTheme}
                                                    styles={SelectStyles()}
                                                    value={
                                                        (TicketStatusesArray.find(
                                                            ({ value }) => value === ticket.status
                                                        ) as ItemPropertyView) ?? null
                                                    }
                                                    options={TicketStatusesArray ?? []}
                                                    placeholder='New Status'
                                                    isClearable
                                                    onChange={(value) =>
                                                        updateTicketStatus(ticket.id, value?.value as TicketStatus)
                                                    }
                                                    getOptionLabel={(status) => status.value}
                                                    getOptionValue={(status) => String(status.id)}
                                                />
                                            </FormField>
                                            <FormField label={'Change device location'}>
                                                <CreatableSelect<ItemPropertyView, false>
                                                    isClearable
                                                    theme={SelectTheme}
                                                    styles={SelectStyles<ItemPropertyView>()}
                                                    options={locations}
                                                    formatCreateLabel={(value) => 'Add a new location: ' + value}
                                                    placeholder='New location'
                                                    value={{ id: 0, value: ticket.deviceLocation } ?? null}
                                                    onCreateOption={(item) => updateDeviceLocation(ticket.id, item)}
                                                    onChange={(newValue) =>
                                                        updateDeviceLocation(ticket.id, newValue?.value)
                                                    }
                                                    getOptionLabel={(item) => item.value}
                                                    getOptionValue={(item) => item.id + item.value}
                                                />
                                            </FormField>
                                        </Space>
                                        <Space direction='vertical' className='card'>
                                            <h3>Ticket status</h3>
                                            <Space.Compact direction={'vertical'}>
                                                <Button
                                                    onClick={() => startTicket(ticket.id)}
                                                    disabled={ticket.status !== 'PENDING'}
                                                    icon={<FontAwesomeIcon icon={faPlay} />}
                                                >
                                                    Start repair
                                                </Button>
                                                <Button
                                                    icon={<FontAwesomeIcon icon={faSnowflake} />}
                                                    onClick={() => freezeTicket(ticket.id)}
                                                >
                                                    Freeze ticket
                                                </Button>{' '}
                                                <Button
                                                    icon={<FontAwesomeIcon icon={faCheck} />}
                                                    onClick={() => completeTicket(ticket.id)}
                                                >
                                                    Finish repair
                                                </Button>
                                                <Button
                                                    icon={<FontAwesomeIcon icon={faFileInvoiceDollar} />}
                                                    onClick={() => setShowInvoiceModal(true)}
                                                >
                                                    Mark as Collected
                                                </Button>
                                            </Space.Compact>
                                        </Space>

                                        <Space direction='vertical' className='card'>
                                            <h3>Other actions</h3>

                                            <Space.Compact direction={'vertical'}>
                                                <Button
                                                    icon={<FontAwesomeIcon icon={faMessage} />}
                                                    onClick={() => navigate('/chats?id=' + ticket.id)}
                                                >
                                                    Open Chat
                                                </Button>
                                                <Space.Compact className={'w-100 justify-between'}>
                                                    <Button
                                                        style={{ flex: 1 }}
                                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                                        onClick={printTicketLabel}
                                                    >
                                                        Print repair tag
                                                    </Button>
                                                    <Button
                                                        icon={<FontAwesomeIcon icon={faEye} />}
                                                        onClick={previewTicketLabel}
                                                    />
                                                </Space.Compact>
                                                <Space.Compact className={'w-100 justify-between'}>
                                                    <Button
                                                        style={{ flex: 1 }}
                                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                                        onClick={printTicket}
                                                    >
                                                        Print ticket
                                                    </Button>
                                                    <Button
                                                        icon={<FontAwesomeIcon icon={faEye} />}
                                                        onClick={previewTicket}
                                                    />
                                                </Space.Compact>

                                                <Button
                                                    icon={<FontAwesomeIcon icon={faHistory} />}
                                                    children={'More details'}
                                                    onClick={() => setTicketLogOpen(true)}
                                                />
                                            </Space.Compact>
                                        </Space>
                                    </Space>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
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
