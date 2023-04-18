import { TicketFilter } from '../../models/interfaces/filters'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getInvoicesReport } from '../../axios/http/invoiceRequests'
import { Button, Card } from 'antd'
import { CustomSuspense } from '../CustomSuspense'
import React from 'react'
import NoFound from 'antd/es/result/noFound'


export const RepairsReport = ({ filter }: { filter: TicketFilter }) => {
    const navigate = useNavigate()
    const { data:report, isLoading } = useQuery(['invoices', filter, 'report'], () => getInvoicesReport({ filter,  }))

    return (
        <Card
            style={{ minWidth: 350, height:'100%' }}
            title='Completed repairs'
            extra={<Button type='link' onClick={() => navigate('/tickets')} children={'See All Tickets'} />}
        >
            <CustomSuspense isReady={!isLoading}>
                <NoFound/>
                <h4>Work in progress</h4>
            </CustomSuspense>
        </Card>
    )
}
