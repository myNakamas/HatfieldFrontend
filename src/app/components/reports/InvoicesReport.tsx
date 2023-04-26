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
import { generateDaysArray } from '../../utils/helperFunctions'
import dateFormat from 'dateformat'
import { dateMask } from '../../models/enums/appEnums'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { InvoiceType, InvoiceTypesArray } from '../../models/enums/invoiceEnums'
import Select from 'react-select'

type ChartType = 'COUNT' | 'INCOME'

export const InvoicesReport = ({ filter }: { filter: TicketFilter }) => {
    const [invoiceType, setInvoiceType] = useState<InvoiceType | undefined>()
    const [chartType, setChartType] = useState<ChartType>('COUNT')
    const { token } = useContext(DesignTokenContext)
    const navigate = useNavigate()
    const { data: report, isLoading } = useQuery(['invoices', filter, 'report'], () =>
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
            style={{ minWidth: 350 }}
            title={
                chartType == 'COUNT'
                    ? `Created invoices: ${report?.totalCount}`
                    : `Income: ${report?.totalAmount.toFixed(2)}£`
            }
            extra={<Button type='link' onClick={() => navigate('/invoices')} children={'See All Invoices'} />}
        >
            <CustomSuspense isReady={!isLoading}>
                <ResponsiveContainer width='100%' height={400} minWidth={350}>
                    <BarChart data={reportCalendar} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
                                return key === 'Daily income' ? [(+value).toFixed(2) + '£', key] : [value, key]
                            }}
                        />
                        <Legend />
                    </BarChart>
                </ResponsiveContainer>
                <Space>
                    Invoice count/income
                    <Switch
                        onChange={() => setChartType((prevState) => (prevState === 'COUNT' ? 'INCOME' : 'COUNT'))}
                    />
                    <Select<ItemPropertyView, false>
                        theme={SelectTheme}
                        styles={SelectStyles()}
                        value={InvoiceTypesArray.find(({ value }) => invoiceType === value) ?? null}
                        options={InvoiceTypesArray ?? []}
                        placeholder='Filter by status'
                        isClearable
                        onChange={(value) => setInvoiceType(value?.value as InvoiceType)}
                        getOptionLabel={(status) => status.value}
                        getOptionValue={(status) => String(status.id)}
                    />
                </Space>
            </CustomSuspense>
        </Card>
    )
}
