import { TicketFilter } from '../models/interfaces/filters'
import React, { useContext, useState } from 'react'
import { Space } from 'antd'
import { AuthContext } from '../contexts/AuthContext'
import { defaultStatisticsFilter } from '../models/enums/defaultValues'
import { InvoicesReport } from '../components/reports/InvoicesReport'
import { DashboardFilters } from './dashboard/Dashboard'
import { SellReport } from '../components/reports/RepairsReport'

export const Statistics = () => {
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>(defaultStatisticsFilter(loggedUser?.shopId))

    return (
        <div className='mainScreen'>
            <Space className='w-100 justify-between' direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}>
                <h2>Statistics</h2>
                <DashboardFilters {...{ filter, setFilter }} />
            </Space>
            <div className={'dashboard-items'}>
                <InvoicesReport filter={filter} />
                <SellReport filter={filter} />
            </div>
        </div>
    )
}
