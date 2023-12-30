import { AppModal } from '../AppModal'
import {
    CreateTicket,
    createTicketFromTicket,
    CreateUsedItem,
    Ticket,
    UsedItemView,
} from '../../../models/interfaces/ticket'
import { useContext, useEffect, useState } from 'react'
import dateFormat from 'dateformat'
import { EditTicketForm } from './EditTicketForm'
import { putCompleteTicket, putFreezeTicket, putStartTicket, updateTicket } from '../../../axios/http/ticketRequests'
import { useQuery, useQueryClient } from 'react-query'
import { ItemPropertyView, PageRequest } from '../../../models/interfaces/generalModels'
import {
    activeTicketStatuses,
    completedTicketStatuses,
    TicketStatus,
    TicketStatusesArray,
} from '../../../models/enums/ticketEnums'
import { toast } from 'react-toastify'
import { toastPrintTemplate, toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { Button, Card, Space, Typography } from 'antd'
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
import { getAllDeviceLocations, getShopData } from '../../../axios/http/shopRequests'
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
    faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FormField } from '../../form/Field'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'
import { DetailedTicketInfoView, TicketModalDescription } from './DetailedTicketInfoView'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'
import { InvoicesTable, openPdfBlob } from '../../../pages/invoices/Invoices'
import { defaultPage } from '../../../models/enums/defaultValues'
import { InvoiceFilter } from '../../../models/interfaces/filters'
import { getAllInvoices } from '../../../axios/http/invoiceRequests'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'

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
    const [isDeposit, setIsDeposit] = useState(false)

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
                                closeModal={() => {
                                    setTicketLogOpen(false)
                                    setIsDeposit(false)
                                }}
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
                        <EditTicketForm
                            isEdit
                            ticket={createTicketFromTicket(ticket)}
                            closeModal={() => setMode('view')}
                        />
                    )}
                    {mode === 'view' && (
                        <TicketViewInner
                            {...{ ticket, setIsUseModalOpen, setTicketLogOpen, setShowInvoiceModal, closeModal }}
                            setShowDepositInvoiceModal={(bool) => {
                                setShowInvoiceModal(bool)
                                setIsDeposit(bool)
                            }}
                        />
                    )}
                    {mode === 'invoice' && <TicketInvoices ticket={ticket} />}
                </>
            )}
        </AppModal>
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
        return await queryClient.invalidateQueries(['tickets'])
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
                    queryClient.invalidateQueries(['tickets']).then()
                    queryClient.invalidateQueries('deviceLocations').then()
                })
        }
    }
    return (
        <Space direction={'vertical'} className='card'>
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
                    value={location}
                    onCreateOption={(item) => updateDeviceLocation(ticket.id, item)}
                    onChange={(newValue) => updateDeviceLocation(ticket.id, newValue)}
                    getOptionLabel={(item) => item.value}
                    getOptionValue={(item) => item.value}
                />
            </FormField>
        </Space>
    )
}

const TicketViewInner = ({
    ticket,
    closeModal,
    setIsUseModalOpen,
    setShowInvoiceModal,
    setShowDepositInvoiceModal,
    setTicketLogOpen,
}: {
    ticket: Ticket
    closeModal: () => void
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
            .then(() => queryClient.invalidateQueries(['tickets']).then())
    }
    const freezeTicket = (id: number) => {
        toast
            .promise(putFreezeTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['tickets']).then())
    }

    const completeTicket = (id: number, success: boolean) => {
        toast
            .promise(putCompleteTicket({ id, success }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then((error) => {
                error && toast.warning(error.detail, toastProps)
                return queryClient.invalidateQueries(['tickets']).then(closeModal)
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
                    <Space wrap className={'w-100 justify-between align-start'}>
                        <TicketStatusAndLocation {...{ ticket }} />
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
                        </Space>
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
