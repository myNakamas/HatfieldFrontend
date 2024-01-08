import { InvoiceFilter } from '../../models/interfaces/filters'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getSalesReport } from '../../axios/http/invoiceRequests'
import { Button, Card, Statistic } from 'antd'
import { CustomSuspense } from '../CustomSuspense'
import React, { useContext, useState } from 'react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DesignTokenContext } from 'antd/es/theme/internal'

interface LeaderboardEntry {
    name: string
    count: number
}

export const SellsReport = ({ filter }: { filter: InvoiceFilter }) => {
    const navigate = useNavigate()
    const { token } = useContext(DesignTokenContext)

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const { data: report, isLoading } = useQuery(
        ['invoices', filter, 'report', 'sell'],
        () => getSalesReport({ filter }),
        {
            onSuccess: ({ leaderboard }) => {
                setLeaderboard(Object.entries(leaderboard).map(([key, value]) => ({ name: key, count: value })))
            },
        }
    )

    return (
        <Card
        className={'dashboard-items'}            title='Sales Leaderboard'
            extra={<Button onClick={() => navigate('/inventory')}>See all items</Button>}
        >
            <Statistic title={'Total amount in sells:'} loading={isLoading} value={report?.totalAmount} />
            <CustomSuspense isReady={!isLoading}>
                <ResponsiveContainer width='100%' height={400} minWidth={350}>
                    <BarChart data={leaderboard}>
                        <XAxis dataKey={'name'} />
                        <YAxis allowDecimals={false} />
                        {<Bar dataKey={'count'} name={'Items sold'} fill={token.colorPrimary} />}
                        <Tooltip<string, string>
                            contentStyle={{
                                borderRadius: token.borderRadius,
                                backgroundColor: token.colorInfo,
                            }}
                            itemStyle={{ color: 'white' }}
                        />
                        <Legend />
                    </BarChart>
                </ResponsiveContainer>
            </CustomSuspense>
        </Card>
    )
}
