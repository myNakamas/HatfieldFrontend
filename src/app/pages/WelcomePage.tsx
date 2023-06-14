import { useQuery } from 'react-query'
import { fetchAllActiveTickets } from '../axios/http/ticketRequests'
import { TicketFilter } from '../models/interfaces/filters'
import { AuthContext } from '../contexts/AuthContext'
import React, { ReactNode, Suspense, useContext, useRef, useState } from 'react'
import { Button, Card, Col, FloatButton, Skeleton, Space, Spin, Tour } from 'antd'
import { CustomSuspense } from '../components/CustomSuspense'
import { ShortTicketTable } from '../components/table/ShortTicketTable'
import { useNavigate } from 'react-router-dom'
import { ViewTicket } from '../components/modals/ticket/ViewTicket'
import { Ticket } from '../models/interfaces/ticket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { welcomePageTourSteps } from '../models/enums/userEnums'
import { getShopData } from '../axios/http/shopRequests'
import { getAllInvoices, getClientInvoicePdf, getInvoicePdf } from '../axios/http/invoiceRequests'
import { defaultPage } from '../models/enums/defaultValues'
import { CustomTable } from '../components/table/CustomTable'
import { NoDataComponent } from '../components/table/NoDataComponent'
import { InventoryItem } from '../models/interfaces/shop'
import { invoiceTypeIcon, paymentMethodIcon } from '../models/enums/invoiceEnums'
import dateFormat from 'dateformat'

export const WelcomePage = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const refsArray = Array.from({ length: 5 }, () => useRef(null))
    const { loggedUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const filter: TicketFilter = { clientId: loggedUser?.userId }
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()

    const { data: tickets, isLoading } = useQuery(['tickets', 'active', filter], () =>
        fetchAllActiveTickets({ filter })
    )

    const { data: shop } = useQuery(['currentShop'], getShopData)

    return (
        <div className={'mainScreen'}>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <div className={'dashboard-items'}>
                <Card
                    ref={refsArray[1]}
                    style={{ minWidth: 350 }}
                    title={`Your Active Tickets: `}
                    extra={
                        <Space>
                            <Button
                                ref={refsArray[2]}
                                type='link'
                                onClick={() => navigate('/tickets')}
                                children={'See All Tickets'}
                            />
                        </Space>
                    }
                >
                    <CustomSuspense isReady={!isLoading}>
                        <ShortTicketTable
                            data={tickets}
                            onClick={({ id }) =>
                                setSelectedTicket(tickets?.find(({ id: ticketId }) => id === ticketId))
                            }
                        />
                    </CustomSuspense>
                </Card>
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
const GridCol = ({ children }: { children?: ReactNode }) => <Col span={10}>{children}</Col>
