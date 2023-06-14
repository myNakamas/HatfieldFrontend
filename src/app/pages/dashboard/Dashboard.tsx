import { TicketFilter } from '../../models/interfaces/filters'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { Shop } from '../../models/interfaces/shop'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { DateTimeFilter } from '../../components/filters/DateTimeFilter'
import { Space } from 'antd'
import { AuthContext } from '../../contexts/AuthContext'
import { defaultDashboardFilter } from '../../models/enums/defaultValues'
import { InvoicesReport } from '../../components/reports/InvoicesReport'
import { ActiveTickets } from './ActiveTickets'
import { ShoppingListCard } from './ShoppingListCard'

export const Dashboard = () => {
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>(defaultDashboardFilter(loggedUser?.shopId))

    return (
        <Space direction='vertical' className='w-100' wrap>
            <Space
                className='w-100 justify-between p-2'
                direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
            >
                <h2>Dashboard</h2>
                <DashboardFilters {...{ filter, setFilter }} />
            </Space>
            <div className={'dashboard-items'}>
                <ActiveTickets filter={filter} />
                <InvoicesReport filter={filter} />
                <ShoppingListCard />
            </div>
        </Space>
    )
}

export const DashboardFilters = ({
    filter,
    setFilter,
}: {
    filter: TicketFilter
    setFilter: (value: ((prevState: TicketFilter) => TicketFilter) | TicketFilter) => void
}) => {
    const { isAdmin } = useContext(AuthContext)
    const { data: shops } = useQuery('shops', getAllShops, { enabled: isAdmin() })

    return (
        <Space>
            <div className='filterField'>
                {isAdmin() && (
                    <Select<Shop, false>
                        theme={SelectTheme}
                        styles={SelectStyles()}
                        value={shops?.find(({ id }) => filter.shopId === id) ?? null}
                        options={shops ?? []}
                        placeholder='Filter by shop'
                        isClearable
                        onChange={(value) => setFilter({ ...filter, shopId: value?.id ?? undefined })}
                        getOptionLabel={(shop) => shop.shopName}
                        getOptionValue={(shop) => String(shop.id)}
                    />
                )}
            </div>
            <DateTimeFilter
                filter={filter}
                setFilter={setFilter}
                dataKeys={{ before: 'createdBefore', after: 'createdAfter' }}
            />
        </Space>
    )
}
