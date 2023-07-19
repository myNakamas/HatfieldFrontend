import { useQuery, useQueryClient } from 'react-query'
import { fetchClientTickets, putCancelTicket, putFreezeTicket } from '../../axios/http/ticketRequests'
import { TicketFilter } from '../../models/interfaces/filters'
import { AuthContext } from '../../contexts/AuthContext'
import React, { Suspense, useContext, useRef, useState } from 'react'
import { Button, Card, FloatButton, Popconfirm, Skeleton, Space, Spin, Switch, Tour } from 'antd'
import { CustomSuspense } from '../../components/CustomSuspense'
import { useNavigate } from 'react-router-dom'
import { ViewTicket } from '../../components/modals/ticket/ViewTicket'
import { Ticket } from '../../models/interfaces/ticket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCancel, faMessage, faPrint, faQuestion, faSnowflake } from '@fortawesome/free-solid-svg-icons'
import { welcomePageTourSteps } from '../../models/enums/userEnums'
import { getShopData } from '../../axios/http/shopRequests'
import { getAllInvoices, getClientInvoicePdf, getInvoicePdf } from '../../axios/http/invoiceRequests'
import { defaultPage } from '../../models/enums/defaultValues'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { InventoryItem } from '../../models/interfaces/shop'
import { invoiceTypeIcon, paymentMethodIcon } from '../../models/enums/invoiceEnums'
import dateFormat from 'dateformat'
import { Page, PageRequest } from '../../models/interfaces/generalModels'
import { activeTicketStatuses, completedTicketStatuses } from '../../models/enums/ticketEnums'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { Deadline } from '../../components/modals/ticket/Deadline'

export const ClientDashboard = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)

    const refsArray = Array.from({ length: 5 }, () => useRef(null))
    const { loggedUser } = useContext(AuthContext)
    const filter: TicketFilter = { clientId: loggedUser?.userId }
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()

    const { data: shop } = useQuery(['currentShop'], getShopData)

    return (
        <div className={'mainScreen'}>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <div className={'dashboard-items'}>
                <ClientTicketTable refs={refsArray} filter={filter} setSelectedTicket={setSelectedTicket} />
                <Card ref={refsArray[3]} style={{ minWidth: 350 }} title={`Invoices: `}>
                    <Suspense fallback={<Spin />}>
                        <InnerInvoices {...{ filter }} />
                    </Suspense>
                </Card>
            </div>

            <Tour
                type={'primary'}
                open={tourIsOpen}
                onClose={() => setTourIsOpen(false)}
                steps={welcomePageTourSteps(refsArray, shop?.shopName)}
            />
            <FloatButton
                tooltip={'Take a tour!'}
                onClick={() => setTourIsOpen(true)}
                icon={<FontAwesomeIcon icon={faQuestion} />}
            />
        </div>
    )
}

export const ClientTicketTable = ({
    filter,
    setSelectedTicket,
    refs,
}: {
    filter: TicketFilter
    setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    refs: React.Ref<HTMLDivElement>[]
}) => {
    const [page, setPage] = useState(defaultPage)
    const [showCompletedTickets, setShowCompletedTickets] = useState(false)
    const { data: tickets, isLoading } = useQuery(['tickets', filter], () =>
        fetchClientTickets({
            page,
            filter: {
                ...filter,
                ticketStatuses: showCompletedTickets ? completedTicketStatuses : activeTicketStatuses,
            },
        })
    )

    return (
        <Card
            ref={refs[1]}
            style={{ minWidth: 350 }}
            title={`Your Tickets: `}
            extra={
                <Space>
                    Completed <Switch ref={refs[2]} onChange={() => setShowCompletedTickets((i) => !i)} />
                </Space>
            }
        >
            <CustomSuspense isReady={!isLoading}>
                {tickets && tickets?.content?.length > 0 ? (
                    showCompletedTickets ? (
                        <CompletedTicketsTable
                            data={tickets}
                            isLoading={isLoading}
                            setSelectedTicket={setSelectedTicket}
                            page={page}
                            setPage={setPage}
                        />
                    ) : (
                        <ActiveTicketsTable
                            data={tickets}
                            isLoading={isLoading}
                            setSelectedTicket={setSelectedTicket}
                            page={page}
                            setPage={setPage}
                        />
                    )
                ) : (
                    <NoDataComponent items={'tickets'} />
                )}
            </CustomSuspense>
        </Card>
    )
}
export const ActiveTicketsTable = ({
    isLoading,
    data,
    setSelectedTicket,
    page,
    setPage,
}: {
    isLoading: boolean
    data?: Page<Ticket>
    setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const freezeTicket = (ticket: Ticket) => {
        toast
            .promise(putFreezeTicket({ id: ticket.id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['tickets']))
    }
    const cancelTicket = (ticket: Ticket) => {
        toast
            .promise(putCancelTicket({ id: ticket.id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['tickets']))
    }

    return (
        <CustomSuspense isReady={!isLoading}>
            <div>
                {data && data.content.length > 0 ? (
                    <CustomTable<Ticket>
                        data={data.content.map((ticket) => ({
                            ...ticket,
                            timestamp: dateFormat(ticket.timestamp),
                            deadline: ticket.deadline ? dateFormat(ticket.deadline) : '-',
                            leftPrice: `£ ${ticket.totalPrice - ticket.deposit}`,
                            actions: (
                                <Space>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faMessage} />}
                                        onClick={() => navigate('/chats?id=' + ticket.id)}
                                    />
                                    <Popconfirm
                                        title={'Freeze the ticket'}
                                        description={'Are you sure?'}
                                        onConfirm={() => freezeTicket(ticket)}
                                    >
                                        <Button icon={<FontAwesomeIcon icon={faSnowflake} />} />
                                    </Popconfirm>
                                    <Popconfirm
                                        title={'Cancel the ticket'}
                                        description={'Are you sure? By agreeing you will stop the repairment process.'}
                                        onConfirm={() => cancelTicket(ticket)}
                                    >
                                        <Button icon={<FontAwesomeIcon icon={faCancel} />} />
                                    </Popconfirm>
                                </Space>
                            ),
                        }))}
                        headers={{
                            timestamp: 'Creation',
                            deadline: 'Due',
                            status: 'Status',
                            leftPrice: 'Left to pay',
                            actions: 'Actions',
                        }}
                        onClick={(ticket) => setSelectedTicket(ticket)}
                        pagination={page}
                        onPageChange={setPage}
                        totalCount={data.totalCount}
                    />
                ) : (
                    <NoDataComponent items='tickets' />
                )}
            </div>
        </CustomSuspense>
    )
}

export const openPdfBlob = (pdfBlob: Blob) => {
    const fileUrl = URL.createObjectURL(pdfBlob)
    window.open(fileUrl)
}

export const CompletedTicketsTable = ({
    isLoading,
    data,
    setSelectedTicket,
    page,
    setPage,
}: {
    isLoading: boolean
    data?: Page<Ticket>
    setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | undefined>>
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => {
    const navigate = useNavigate()
    const openPdf = async (invoiceId: number) => {
        const pdfBlob = await getInvoicePdf(invoiceId)
        openPdfBlob(pdfBlob)
    }
    return (
        <CustomSuspense isReady={!isLoading}>
            <div>
                {data && data.content.length > 0 ? (
                    <CustomTable<Ticket>
                        data={data.content.map((ticket) => ({
                            ...ticket,
                            timestamp: dateFormat(ticket.timestamp),
                            collectedTimestamp: dateFormat(ticket.invoice?.timestamp),
                            warrantyLeft: <Deadline deadline={ticket.invoice?.warrantyLeft} />,
                            actions: (
                                <Space>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                        onClick={() => openPdf(ticket.id)}
                                    />
                                    <Button
                                        icon={<FontAwesomeIcon icon={faMessage} />}
                                        onClick={() => navigate('/chats?id=' + ticket.id)}
                                    />
                                </Space>
                            ),
                        }))}
                        headers={{
                            timestamp: 'Creation',
                            collectedTimestamp: 'Collected time/date',
                            status: 'Status',
                            warrantyLeft: 'Warranty left',
                            actions: 'Actions',
                        }}
                        onClick={(ticket) => setSelectedTicket(ticket)}
                        pagination={page}
                        onPageChange={setPage}
                        totalCount={data.totalCount}
                    />
                ) : (
                    <NoDataComponent items='tickets' />
                )}
            </div>
        </CustomSuspense>
    )
}

function InnerInvoices({ filter }: { filter: TicketFilter }) {
    const [page, setPage] = useState(defaultPage)
    const navigate = useNavigate()
    const { isClient } = useContext(AuthContext)
    const openPdf = async (invoiceId: number) => {
        const pdfBlob = isClient() ? await getClientInvoicePdf(invoiceId) : await getInvoicePdf(invoiceId)
        if (pdfBlob) {
            const fileUrl = URL.createObjectURL(pdfBlob)
            const pdfPage = window.open(fileUrl)
            if (pdfPage) pdfPage.document.title = 'Hatfield Invoice ' + invoiceId
        }
    }
    const { data: invoices, isLoading } = useQuery(['invoices', page, filter], () => getAllInvoices({ page, filter }), {
        suspense: true,
    })
    if (!invoices?.content || invoices.content.length == 0) return <NoDataComponent items={'invoices'} />
    return (
        <div>
            {isLoading ? (
                <Skeleton loading />
            ) : invoices && invoices.content.length > 0 ? (
                <CustomTable<InventoryItem>
                    data={invoices.content.map((invoice) => ({
                        ...invoice,
                        type: (
                            <>
                                <FontAwesomeIcon icon={invoiceTypeIcon[invoice.type]} /> {invoice.type}
                            </>
                        ),
                        timestamp: dateFormat(invoice.timestamp),
                        price: invoice.totalPrice.toFixed(2),
                        createdBy: invoice.createdBy.fullName,
                        client: invoice.client?.fullName ?? '-',
                        payment: (
                            <>
                                <FontAwesomeIcon icon={paymentMethodIcon[invoice.paymentMethod]} />{' '}
                                {invoice.paymentMethod}
                            </>
                        ),
                        actions: (
                            <Space>
                                <Button icon={<FontAwesomeIcon icon={faPrint} />} onClick={() => openPdf(invoice.id)} />
                            </Space>
                        ),
                    }))}
                    headers={{
                        type: 'Invoice type',
                        timestamp: 'Created at',
                        price: 'Total price',
                        actions: 'Actions',
                    }}
                    totalCount={invoices.totalCount}
                    onClick={({ id }) => navigate('/invoices/' + id)}
                    pagination={page}
                    onPageChange={setPage}
                />
            ) : (
                <NoDataComponent items='invoices' />
            )}
        </div>
    )
}
