import { TicketFilter } from '../../models/interfaces/filters'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getWorkerShops } from '../../axios/http/shopRequests'
import { DateTimeFilter } from '../../components/filters/DateTimeFilter'
import { Space } from 'antd'
import { AuthContext } from '../../contexts/AuthContext'
import { defaultDashboardFilter } from '../../models/enums/defaultValues'
import { ActiveTickets } from './ActiveTickets'
import { ShoppingListCard } from './ShoppingListCard'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { InventoryCard } from './InventoryCard'
import { AppSelect } from '../../components/form/AppSelect'

export const Dashboard = () => {
    const { loggedUser, isWorker } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>(defaultDashboardFilter(loggedUser?.shopId))
    const isUserFromShop = filter.shopId === loggedUser?.shopId

    if (!isWorker()) return <></>
    return (
        <div className='mainScreen'>
            <Space direction='vertical' className='w-100 ' wrap>
                <Space wrap className='w-100 justify-between'>
                    <h2>Dashboard</h2>
                    <DashboardFilters {...{ filter, setFilter }} />
                </Space>
                <div className={'dashboard-items'}>
                    <ActiveTickets filter={filter} />
                    {isUserFromShop ? <ShoppingListCard filter={filter} /> : <InventoryCard filter={filter} />}
                </div>
            </Space>
        </div>
    )
}

export const DashboardFilters = ({
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
