import { TicketFilter } from '../models/interfaces/filters'
import { useContext, useState } from 'react'
import { Space } from 'antd'
import { AuthContext } from '../contexts/AuthContext'
import { defaultStatisticsFilter } from '../models/enums/defaultValues'
import { InvoicesReport } from '../components/reports/InvoicesReport'
import { SellsReport } from '../components/reports/SellsReport'
import { TicketsReport } from '../components/reports/TicketsReport'
import { useQuery } from 'react-query'
import { getWorkerShops } from '../axios/http/shopRequests'
import { AppSelect } from '../components/form/AppSelect'
import { ItemPropertyView } from '../models/interfaces/generalModels'
import { DateTimeFilter } from '../components/filters/DateTimeFilter'

export const Statistics = () => {
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>(defaultStatisticsFilter(loggedUser?.shopId))

    return (
        <div className='mainScreen'>
            <Space wrap className='w-100 justify-between'>
                <h2>Statistics</h2>
                <StatisticsFilters {...{ filter, setFilter }} />
            </Space>
            <div className={'dashboard-items'}>
                <InvoicesReport filter={filter} />
                <SellsReport filter={filter} />
                <TicketsReport filter={filter} />
            </div>
        </div>
    )
}

export const StatisticsFilters = ({
    filter,
    setFilter,
}: {
    filter: TicketFilter
    setFilter: (value: ((prevState: TicketFilter) => TicketFilter) | TicketFilter) => void
}) => {
    const { isClient } = useContext(AuthContext)
    const { data: shops } = useQuery(['shops', 'short'], getWorkerShops, { enabled: !isClient() })

    return (
        <Space wrap>
            <AppSelect<number, ItemPropertyView>
                aria-label='Shop filter'
                value={filter.shopId}
                options={shops ?? []}
                placeholder='Filter by shop'
                onChange={(value) => setFilter({ ...filter, shopId: value ?? undefined })}
                getOptionLabel={(shop) => shop.value}
                getOptionValue={(shop) => shop.id}
            />
            <DateTimeFilter
                filter={filter}
                setFilter={setFilter}
                dataKeys={{ before: 'createdBefore', after: 'createdAfter' }}
            />
        </Space>
    )
}
