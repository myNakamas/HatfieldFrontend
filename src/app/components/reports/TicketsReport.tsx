import { InvoiceFilter } from '../../models/interfaces/filters'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getSalesReport } from '../../axios/http/invoiceRequests'
import { Button, Card, Result, Statistic } from 'antd'
import { CustomSuspense } from '../CustomSuspense'
import React, { useContext, useState } from 'react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DesignTokenContext } from 'antd/es/theme/internal'

interface LeaderboardEntry {
    name: string
    count: number
}

export const TicketsReport = ({ filter }: { filter: InvoiceFilter }) => {
    const navigate = useNavigate()
    const { token } = useContext(DesignTokenContext)

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const { data: report, isLoading } = useQuery(
        ['tickets', 'report'],
        () => getSalesReport({ filter }),
        {
            onSuccess: ({ leaderboard }) => {
                setLeaderboard(Object.entries(leaderboard).map(([key, value]) => ({ name: key, count: value })))
            },
        }
    )

    return (
        <Card
        className={'dashboard-items'}            title='Tickets Leaderboard'
        >
                <Result status={'info'}>Work in progress</Result>
        </Card>
    )
}
