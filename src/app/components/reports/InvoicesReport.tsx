import { TicketFilter } from '../../models/interfaces/filters'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { getInvoicesReport } from '../../axios/http/invoiceRequests'
import { Button, Card, Space, Switch } from 'antd'
import { CustomSuspense } from '../CustomSuspense'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import React, { useContext, useState } from 'react'
import { DesignTokenContext } from 'antd/es/theme/internal'
import moment from 'moment/moment'
import { currencyFormat, generateDaysArray } from '../../utils/helperFunctions'
import dateFormat from 'dateformat'
import { dateMask } from '../../models/enums/appEnums'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { InvoiceType, InvoiceTypesArray } from '../../models/enums/invoiceEnums'
import { AppSelect } from '../form/AppSelect'

type ChartType = 'COUNT' | 'INCOME'

export const InvoicesReport = ({ filter }: { filter: TicketFilter }) => {
    const [invoiceType, setInvoiceType] = useState<InvoiceType | undefined>()
    const [chartType, setChartType] = useState<ChartType>('COUNT')
    const { token } = useContext(DesignTokenContext)
    const navigate = useNavigate()
    const { data: report, isLoading } = useQuery(['invoices', invoiceType, filter, 'report'], () =>
        getInvoicesReport({ filter: { ...filter, type: invoiceType } })
    )

    const daysArray = generateDaysArray(filter.createdAfter, filter.createdBefore)

    const mergedArray = daysArray.map((day) => {
        const match = report?.calendar.find((item) => moment(item.date).isSame(day, 'day'))
        return match || { count: 0, dailyIncome: 0, date: day.format('YYYY-MM-DD') }
    })

    const reportCalendar = mergedArray.map(({ count, dailyIncome, date }) => ({
        'Invoice Count': count,
        'Daily income': dailyIncome,
        Date: dateFormat(date, dateMask),
    }))
    return (
        <Card
            className='dashboard-card'
            title={
                chartType == 'COUNT'
                    ? `Created invoices: ${report?.totalCount}`
                    : `Income: ${currencyFormat(report?.totalAmount)}`
            }
            extra={<Button type='link' onClick={() => navigate('/invoices')} children={'See All Invoices'} />}
        >
            <CustomSuspense isReady={!isLoading}>
                <ResponsiveContainer width='100%' height={400} minWidth={350}>
                    <BarChart data={reportCalendar}>
                        <XAxis dataKey={'Date'} />
                        <YAxis allowDecimals={false} />
                        {chartType == 'COUNT' && <Bar dataKey={'Invoice Count'} fill={token.colorPrimary} />}
                        {chartType == 'INCOME' && <Bar dataKey={'Daily income'} fill={token.colorFill} />}
                        <Tooltip<string, string>
                            contentStyle={{
                                borderRadius: token.borderRadius,
                                backgroundColor: token.colorInfo,
                            }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value, key) => {
                                return key === 'Daily income' ? [currencyFormat(+value), key] : [value, key]
                            }}
                        />
                        <Legend />
                    </BarChart>
                </ResponsiveContainer>
                <Space wrap className='w-100 justify-between'>
                    <div>Invoice count/income {' '}
                    <Switch
                        onChange={() => setChartType((prevState) => (prevState === 'COUNT' ? 'INCOME' : 'COUNT'))}
                    /></div>
                    <AppSelect<InvoiceType, ItemPropertyView>
                        value={invoiceType}
                        options={InvoiceTypesArray}
                        placeholder={'Filter by Invoice status'}
                        onChange={(type) => setInvoiceType(type ?? undefined)}
                        getOptionLabel={(status) => status.value}
                        getOptionValue={(status) => status.value as InvoiceType}
                    />
                </Space>
            </CustomSuspense>
        </Card>
    )
}
