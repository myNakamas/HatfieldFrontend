import { useQuery } from 'react-query'
import { fetchAllActiveTickets } from '../axios/http/ticketRequests'
import { TicketFilter } from '../models/interfaces/filters'
import { AuthContext } from '../contexts/AuthContext'
import React, { ReactNode, Suspense, useContext, useRef, useState } from 'react'
import { Button, Card, Col, FloatButton, Row, Space, Spin, Tour } from 'antd'
import { CustomSuspense } from '../components/CustomSuspense'
import { ShortTicketTable } from '../components/table/ShortTicketTable'
import { useNavigate } from 'react-router-dom'
import { ViewTicket } from '../components/modals/ticket/ViewTicket'
import { Ticket } from '../models/interfaces/ticket'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'
import { userTourSteps, welcomePageTourSteps } from '../models/enums/userEnums'
import { getShopData } from '../axios/http/shopRequests'
import { getAllInvoices } from '../axios/http/invoiceRequests'
import { User } from '../models/interfaces/user'
import { defaultPage } from '../models/enums/defaultValues'
import { CustomTable } from '../components/table/CustomTable'
import { Invoice } from '../models/interfaces/invoice'
import { NoDataComponent } from '../components/table/NoDataComponent'

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
            <Row justify={'space-around'} className={'w-100'}>
                <GridCol>
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
                </GridCol>
                <GridCol>
                    <Card ref={refsArray[3]} style={{ minWidth: 350 }} title={`Invoices: `}>
                        <Suspense fallback={<Spin />}>
                            <InnerInvoices {...{ filter }} />
                        </Suspense>
                    </Card>
                </GridCol>
            </Row>
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
    const { data: invoices } = useQuery(['invoices', page, filter], () => getAllInvoices({ page, filter }), {
        suspense: true,
    })
    if (!invoices?.content || invoices.content.length == 0) return <NoDataComponent items={'invoices'} />
    return <CustomTable<Invoice> headers={{}} data={invoices?.content} pagination={page} onPageChange={setPage} />
}
const GridCol = ({ children }: { children?: ReactNode }) => <Col span={10}>{children}</Col>
