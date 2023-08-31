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
import { ItemPropertyView } from '../../../models/interfaces/generalModels'
import { activeTicketStatuses, TicketStatus, TicketStatusesArray } from '../../../models/enums/ticketEnums'
import { toast } from 'react-toastify'
import { toastPrintTemplate, toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { Button, Card, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'
import { CustomTable } from '../../table/CustomTable'
import { NoDataComponent } from '../../table/NoDataComponent'
import { AddUsedItem } from './AddUsedItem'
import { useNavigate } from 'react-router-dom'
import { AddTicketInvoice } from '../AddTicketInvoice'
import {
    getTicketImage,
    getTicketLabelImage,
    postPrintTicket,
    postPrintTicketLabel,
} from '../../../axios/http/documentRequests'
import { AuthContext } from '../../../contexts/AuthContext'
import { getAllDeviceLocations } from '../../../axios/http/shopRequests'
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
import { FormField } from '../../form/Field'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'
import { DetailedTicketInfoView, TicketModalDescription } from './DetailedTicketInfoView'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'

export const TicketView = ({
    ticket,
    closeModal,
    view,
}: {
    ticket?: Ticket
    closeModal: () => void
    view?: string
}) => {
    const { isWorker } = useContext(AuthContext)
    const [mode, setMode] = useState('view')
    const [ticketLogOpen, setTicketLogOpen] = useState(false)
    const [isUseModalOpen, setIsUseModalOpen] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)

    useEffect(() => {
        if (view) setMode(view)
        else setMode('view')
    }, [view])

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
                    {isWorker() && (
                        <>
                            <DetailedTicketInfoView
                                ticket={ticket}
                                closeModal={() => setTicketLogOpen(false)}
                                show={ticketLogOpen}
                            />
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
                            isEdit
                            ticket={createTicketFromTicket(ticket)}
                            closeModal={() => setMode('view')}
                        />
                    )}
                    {mode === 'view' && (
                        <TicketViewInner
                            {...{ ticket, setIsUseModalOpen, setTicketLogOpen, setShowInvoiceModal, closeModal }}
                        />
                    )}
                </>
            )}
        </AppModal>
    )
}

const TicketViewInner = ({
    ticket,
    closeModal,
    setIsUseModalOpen,
    setShowInvoiceModal,
    setTicketLogOpen,
}: {
    ticket: Ticket
    closeModal: () => void
    setIsUseModalOpen: (value: boolean) => void
    setShowInvoiceModal: (value: boolean) => void
    setTicketLogOpen: (value: boolean) => void
}) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { isWorker } = useContext(AuthContext)
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)

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
        toast.promise(putCompleteTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps).then((error) => {
            error && toast.warning(error.detail, toastProps)
            return queryClient.invalidateQueries(['tickets']).then(closeModal)
        })
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
                .then(() => {
                    queryClient.invalidateQueries(['tickets'])
                    queryClient.invalidateQueries('deviceLocations')
                })
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
                                <AppSelect<TicketStatus, ItemPropertyView>
                                    options={TicketStatusesArray}
                                    placeholder='Select a status'
                                    value={ticket.status}
                                    onChange={(value) => value && updateTicketStatus(ticket.id, value)}
                                    getOptionLabel={(status) => status.value}
                                    getOptionValue={(status) => status.value as TicketStatus}
                                />
                            </FormField>
                            <FormField label={'Change device location'}>
                                <AppCreatableSelect<ItemPropertyView>
                                    options={locations}
                                    placeholder='New location'
                                    value={ticket.deviceLocation}
                                    onCreateOption={(item) => updateDeviceLocation(ticket.id, item)}
                                    onChange={(newValue) => newValue && updateDeviceLocation(ticket.id, newValue)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => item.value}
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
                                    <Button icon={<FontAwesomeIcon icon={faEye} />} onClick={previewTicketLabel} />
                                </Space.Compact>
                                <Space.Compact className={'w-100 justify-between'}>
                                    <Button
                                        style={{ flex: 1 }}
                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                        onClick={printTicket}
                                    >
                                        Print ticket
                                    </Button>
                                    <Button icon={<FontAwesomeIcon icon={faEye} />} onClick={previewTicket} />
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
    )
}
