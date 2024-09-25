import {
    faCheck,
    faEye,
    faFileInvoice,
    faFileInvoiceDollar,
    faHistory,
    faMessage,
    faPlay,
    faPlus,
    faSnowflake,
    faX,
    faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, Result, Skeleton, Space, Spin, Tag, Typography } from 'antd'
import dateFormat from 'dateformat'
import { useContext, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    getTicketImage,
    getTicketLabelImage,
    postPrintTicket,
    postPrintTicketLabel,
} from '../../../axios/http/documentRequests'
import { getAllInvoices } from '../../../axios/http/invoiceRequests'
import { getAllDeviceLocations, getShopData } from '../../../axios/http/shopRequests'
import {
    fetchTicketById,
    putCompleteTicket,
    putFreezeTicket,
    putStartTicket,
    updateTicket,
} from '../../../axios/http/ticketRequests'
import { AuthContext } from '../../../contexts/AuthContext'
import { defaultPage } from '../../../models/enums/defaultValues'
import {
    activeTicketStatuses,
    completedTicketStatuses,
    TicketStatus,
    TicketStatusesArray,
} from '../../../models/enums/ticketEnums'
import { InvoiceFilter } from '../../../models/interfaces/filters'
import { AppError, ItemPropertyView, PageRequest } from '../../../models/interfaces/generalModels'
import { CreateTicket, CreateUsedItem, Ticket, UsedItemView } from '../../../models/interfaces/ticket'
import { TicketSchema } from '../../../models/validators/FormValidators'
import { InvoicesTable, openPdfBlob } from '../../../pages/invoices/Invoices'
import { ChatBadge } from '../../ChatBadge'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'
import { FormField } from '../../form/Field'
import { CustomTable } from '../../table/CustomTable'
import { NoDataComponent } from '../../table/NoDataComponent'
import { AddTicketInvoice } from '../AddTicketInvoice'
import { AppModal } from '../AppModal'
import { toastPrintTemplate, toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { AddUsedItem } from './AddUsedItem'
import { DetailedTicketInfoView, TicketModalDescription } from './DetailedTicketInfoView'
import { formatDeadline, TicketForm } from './TicketForm'

export const TicketView = ({
    ticketId,
    open,
    closeModal,
    view,
}: {
    ticketId?: number
    open: boolean
    closeModal: () => void
    view?: string
}) => {
    const {
        data: ticket,
        isFetching,
        isError,
    } = useQuery(['ticket', ticketId], () => fetchTicketById(ticketId), {
        enabled: !!ticketId,
        refetchInterval: false,
    })
    const [mode, setMode] = useState(view ?? 'view')
    useEffect(() => {
        if (view && view !==mode) setMode(view)
    }, [view])
    return (
        <AppModal
            centered
            closeIcon={<FontAwesomeIcon icon={faX} />}
            isModalOpen={open}
            closeModal={() => closeModal()}
            maskClosable={false}
            title={`Ticket #${ticketId}`}
        >
            {isFetching ? (
                <Spin tip={'Loading ticket'}>
                    <Skeleton loading active paragraph={{ rows: 8 }} title round />
                </Spin>
            ) : isError || !ticket ? (
                <Result status={'error'} title='Could not find ticket' />
            ) : (
                <TicketViewContent ticket={ticket} mode={mode} setMode={setMode} />
            )}
        </AppModal>
    )
}

const TicketViewContent = ({
    ticket,
    mode,
    setMode,
}: {
    ticket: Ticket
    mode?: string
    setMode: (mode: string) => void
}) => {
    const { isWorker } = useContext(AuthContext)
    const [ticketLogOpen, setTicketLogOpen] = useState(false)
    const [isUseModalOpen, setIsUseModalOpen] = useState(false)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)
    const [isDeposit, setIsDeposit] = useState(false)

    const queryClient = useQueryClient()
    const [formStatus, setFormStatus] = useState('')

    const form = useForm<CreateTicket>({ defaultValues: ticket, resolver: yupResolver(TicketSchema) })
    const formRef = useRef<HTMLFormElement>(null)

    const resetForm = (ticket: Ticket | undefined) => {
        formRef.current?.reset()
        form.reset(ticket)
    }

    const onCancel = () => {
        resetForm(ticket)
        setMode('view')
    }

    const onFormSubmit = (data: CreateTicket) => {
        data.deadline = formatDeadline(data)
        setFormStatus('loading')
        updateTicket({ id: data?.id, ticket: data })
            .then(() => {
                return queryClient.invalidateQueries(['ticket', data?.id])
            })
            .then(() => {
                onCancel()
            })
            .catch((error: AppError) => {
                form.setError('root', { message: error?.detail })
            })
            .finally(() => setFormStatus(''))
    }

    useEffect(() => {
        resetForm(ticket)
    }, [ticket?.id])

    return (
        <>
            {isWorker() && (
                <>
                    <DetailedTicketInfoView
                        ticket={ticket}
                        closeModal={() => {
                            setTicketLogOpen(false)
                            setIsDeposit(false)
                        }}
                        show={ticketLogOpen}
                    />
                    <AddUsedItem
                        usedItem={{ itemId: undefined, count: 1, ticketId: ticket.id } as unknown as CreateUsedItem}
                        closeModal={() => setIsUseModalOpen(false)}
                        show={isUseModalOpen}
                    />
                    <AddTicketInvoice
                        ticket={ticket}
                        isDeposit={isDeposit}
                        closeModal={() => setShowInvoiceModal(false)}
                        isModalOpen={showInvoiceModal}
                    />
                </>
            )}
            <div className='editModalButton '>
                {mode === 'view' && isWorker() ? (
                    <Space>
                        <Button
                            icon={<FontAwesomeIcon icon={faPenToSquare} size={'lg'} />}
                            onClick={() => setMode('edit')}
                            title={'Edit ticket'}
                        />
                        <Button
                            icon={<FontAwesomeIcon icon={faFileInvoice} size={'lg'} />}
                            onClick={() => setMode('invoice')}
                            title={'View Ticket invoices'}
                        />
                    </Space>
                ) : (
                    <Button
                        icon={<FontAwesomeIcon icon={faArrowLeft} size={'lg'} />}
                        onClick={() => setMode('view')}
                        title={'Go back to ticket view'}
                    />
                )}
            </div>
            {mode === 'edit' && (
                <div>
                    <TicketForm
                        formRef={formRef}
                        form={form}
                        formStatus={formStatus}
                        ticket={ticket}
                        onSubmit={onFormSubmit}
                        onCancel={onCancel}
                    />
                    <Space className='w-100 justify-end p-2'>
                        <Button children='Save changes' onClick={form.handleSubmit(onFormSubmit)} type='primary' />
                        <Button children='Cancel' onClick={onCancel} type='default' />
                    </Space>
                </div>
            )}
            {mode === 'view' && (
                <TicketViewInner
                    {...{ ticket, setIsUseModalOpen, setTicketLogOpen, setShowInvoiceModal }}
                    setShowDepositInvoiceModal={(bool) => {
                        setShowInvoiceModal(bool)
                        setIsDeposit(bool)
                    }}
                />
            )}
            {mode === 'invoice' && <TicketInvoices ticket={ticket} />}
        </>
    )
}

const TicketStatusAndLocation = ({ ticket }: { ticket: Ticket }) => {
    const queryClient = useQueryClient()
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)
    const [location, setLocation] = useState<string | null>(ticket.deviceLocation)

    const updateTicketStatus = async (id: number, ticketStatus: TicketStatus) => {
        await toast.promise(
            updateTicket({ id, ticket: { id, status: ticketStatus } as unknown as CreateTicket }),
            toastUpdatePromiseTemplate('ticket status'),
            toastProps
        )
        return await queryClient.invalidateQueries(['ticket', ticket.id])
    }

    const updateDeviceLocation = (id: number, deviceLocation: string | null) => {
        setLocation(deviceLocation)
        if (deviceLocation) {
            toast
                .promise(
                    updateTicket({ id, ticket: { id, deviceLocation } as unknown as CreateTicket }),
                    toastUpdatePromiseTemplate('device location'),
                    toastProps
                )
                .then(() => {
                    queryClient.invalidateQueries(['ticket', ticket.id]).then()
                    queryClient.invalidateQueries('deviceLocations').then()
                })
        }
    }
    return (
        <Card title='Status & Location' type='inner' size='small'>
            <FormField label={'Ticket status'}>
                <AppSelect<TicketStatus, ItemPropertyView>
                    options={TicketStatusesArray}
                    placeholder='Select a status'
                    value={ticket.status}
                    onChange={(value) => value && updateTicketStatus(ticket.id, value)}
                    getOptionLabel={(status) => status.value}
                    getOptionValue={(status) => status.value as TicketStatus}
                />
            </FormField>
            <FormField label={'Device location'}>
                <AppCreatableSelect<ItemPropertyView>
                    options={locations}
                    placeholder='New location'
                    value={location ?? undefined}
                    onChange={(newValue) => updateDeviceLocation(ticket.id, newValue)}
                    getOptionLabel={(item) => item.value}
                    getOptionValue={(item) => item.value}
                />
            </FormField>
        </Card>
    )
}

const TicketViewInner = ({
    ticket,
    setIsUseModalOpen,
    setShowInvoiceModal,
    setShowDepositInvoiceModal,
    setTicketLogOpen,
}: {
    ticket: Ticket
    setIsUseModalOpen: (value: boolean) => void
    setShowInvoiceModal: (value: boolean) => void
    setShowDepositInvoiceModal: (value: boolean) => void
    setTicketLogOpen: (value: boolean) => void
}) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { isWorker } = useContext(AuthContext)
    const { data: shop } = useQuery(['currentShop'], getShopData)

    const startTicket = (id: number) => {
        toast
            .promise(putStartTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['ticket', ticket.id]).then())
    }
    const freezeTicket = (id: number) => {
        toast
            .promise(putFreezeTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['ticket', ticket.id]).then())
    }

    const completeTicket = (id: number, success: boolean) => {
        toast
            .promise(putCompleteTicket({ id, success }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then((error) => {
                error && toast.warning(error.detail, toastProps)
                return queryClient.invalidateQueries(['ticket', ticket.id])
            })
    }
    const printTicketLabel = () => {
        toast.promise(postPrintTicketLabel(ticket?.id), toastPrintTemplate, toastProps).then(openPdfBlob)
    }
    const previewTicketLabel = () => {
        toast.promise(getTicketLabelImage(ticket?.id), toastPrintTemplate, toastProps).then(openPdfBlob)
    }
    const printTicket = () => {
        toast.promise(postPrintTicket(ticket?.id), toastPrintTemplate, toastProps).then(openPdfBlob)
    }
    const previewTicket = () => {
        toast.promise(getTicketImage(ticket?.id), toastPrintTemplate, toastProps).then(openPdfBlob)
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
                    <Space wrap className={'w-100 justify-between align-start ticket-cards'}>
                        <TicketStatusAndLocation {...{ ticket }} />
                        <Card title={'Modify actions'} extra={<Tag>{ticket.status}</Tag>} type='inner' size='small'>
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
                                    disabled={ticket.status == 'ON_HOLD'}
                                    onClick={() => freezeTicket(ticket.id)}
                                >
                                    Freeze ticket
                                </Button>
                                <Button.Group>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faCheck} />}
                                        disabled={completedTicketStatuses.includes(ticket.status)}
                                        onClick={() => completeTicket(ticket.id, true)}
                                    >
                                        Finish repair
                                    </Button>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faXmark} />}
                                        disabled={completedTicketStatuses.includes(ticket.status)}
                                        onClick={() => completeTicket(ticket.id, false)}
                                    >
                                        Unsuccessful repair
                                    </Button>
                                </Button.Group>
                                <Button
                                    icon={<FontAwesomeIcon icon={faFileInvoiceDollar} />}
                                    disabled={ticket.status == 'COLLECTED'}
                                    onClick={() => setShowInvoiceModal(true)}
                                >
                                    Mark as Collected
                                </Button>
                            </Space.Compact>
                        </Card>
                        <Card title={'Other actions'} type='inner' size='small'>
                            <Space.Compact direction={'vertical'}>
                                <Button
                                    icon={
                                        <ChatBadge ticketId={ticket.id}>
                                            <FontAwesomeIcon icon={faMessage} />
                                        </ChatBadge>
                                    }
                                    onClick={() => navigate('/chats?id=' + ticket.id)}
                                >
                                    Open chat
                                </Button>
                                <Space.Compact className={'w-100 justify-between'}>
                                    <Button
                                        title={
                                            !shop?.shopSettingsView.printEnabled
                                                ? 'Printing is disabled for your shop'
                                                : 'Print a tag for the device'
                                        }
                                        disabled={!shop?.shopSettingsView.printEnabled}
                                        style={{ flex: 1 }}
                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                        onClick={printTicketLabel}
                                    >
                                        Print repair tag
                                    </Button>
                                    <Button
                                        title={
                                            !shop?.shopSettingsView.printEnabled
                                                ? 'Printing is disabled for your shop'
                                                : 'Preview the tag'
                                        }
                                        disabled={!shop?.shopSettingsView.printEnabled}
                                        icon={<FontAwesomeIcon icon={faEye} />}
                                        onClick={previewTicketLabel}
                                    />
                                </Space.Compact>
                                <Space.Compact className={'w-100 justify-between'}>
                                    <Button
                                        title={
                                            !shop?.shopSettingsView.printEnabled
                                                ? 'Printing is disabled for your shop'
                                                : 'Print a ticket for the user'
                                        }
                                        disabled={!shop?.shopSettingsView.printEnabled}
                                        style={{ flex: 1 }}
                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                        onClick={printTicket}
                                    >
                                        Print ticket
                                    </Button>
                                    <Button
                                        title={
                                            !shop?.shopSettingsView.printEnabled
                                                ? 'Printing is disabled for your shop'
                                                : 'Preview the ticket'
                                        }
                                        disabled={!shop?.shopSettingsView.printEnabled}
                                        icon={<FontAwesomeIcon icon={faEye} />}
                                        onClick={previewTicket}
                                    />
                                </Space.Compact>
                                <Space.Compact>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                        onClick={() => setShowDepositInvoiceModal(true)}
                                    >
                                        Create invoice for deposit
                                    </Button>
                                </Space.Compact>

                                <Button
                                    icon={<FontAwesomeIcon icon={faHistory} />}
                                    children={'More details'}
                                    onClick={() => setTicketLogOpen(true)}
                                />
                            </Space.Compact>
                        </Card>
                    </Space>
                </>
            )}
        </div>
    )
}

const TicketInvoices = ({ ticket }: { ticket: Ticket }) => {
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const [filter] = useState<InvoiceFilter>({ valid: true, ticketId: ticket.id })
    const { data: invoices, isLoading } = useQuery(['invoices', page, filter], () => getAllInvoices({ page, filter }))

    return (
        <div className={'w-100'}>
            <Space>
                <Typography>
                    <h3>Invoices for ticket#{ticket.id}</h3>
                </Typography>
            </Space>
            {invoices ? (
                <InvoicesTable {...{ page, setPage, invoices, isLoading }} />
            ) : (
                <NoDataComponent items={'invoices'} />
            )}
        </div>
    )
}
