import { InvoiceFilter } from '../../models/interfaces/filters'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getTicketsReport } from '../../axios/http/invoiceRequests'
import { Card, Statistic } from 'antd'
import { CustomSuspense } from '../CustomSuspense'
import { useContext } from 'react'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DesignTokenContext } from 'antd/es/theme/internal'
import dateFormat from 'dateformat'
import { dateMask } from '../../models/enums/appEnums'
import { generateDaysArray } from '../../utils/helperFunctions'
import moment from 'moment'

export const TicketsReport = ({ filter }: { filter: InvoiceFilter }) => {
    const navigate = useNavigate()
    const { token } = useContext(DesignTokenContext)

    const { data: report, isLoading } = useQuery(['tickets', filter, 'report'], () => getTicketsReport({ filter }))

    const daysArray = generateDaysArray(filter.createdAfter, filter.createdBefore)
    const reportCalendar = daysArray
        .map((day) => {
            const match = report?.calendar.find((item) => moment(item.date).isSame(day, 'day'))
            return match || { created: 0, completed: 0, date: day.format('YYYY-MM-DD') }
        })
        .map(({ created, completed, date }) => ({
            'Created tickets': created,
            'Completed tickets': completed,
            Date: dateFormat(date, dateMask),
        }))

    return (
        <Card className={'dashboard-items'} title='Tickets Leaderboard'>
            <Statistic title={'Total amount in sells:'} loading={isLoading} value={report?.totalAmount} />
            <CustomSuspense isReady={!isLoading}>
                <ResponsiveContainer width='100%' height={400} minWidth={350}>
                    <BarChart data={reportCalendar}>
                        <XAxis dataKey={'Date'} />
                        <YAxis allowDecimals={false} />
                        <Bar dataKey={'Created tickets'} fill={token.colorPrimary} />
                        <Bar dataKey={'Completed tickets'} fill={token.colorFill} />
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
