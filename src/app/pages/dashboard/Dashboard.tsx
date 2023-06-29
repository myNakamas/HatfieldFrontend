import { TicketFilter } from '../../models/interfaces/filters'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { Shop } from '../../models/interfaces/shop'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { DateTimeFilter } from '../../components/filters/DateTimeFilter'
import { Button, Space } from 'antd'
import { AuthContext } from '../../contexts/AuthContext'
import { defaultDashboardFilter } from '../../models/enums/defaultValues'
import { ActiveTickets } from './ActiveTickets'
import { ShoppingListCard } from './ShoppingListCard'
import { QrReaderModal } from '../../components/modals/QrReaderModal'

export const Dashboard = () => {
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<TicketFilter>(defaultDashboardFilter(loggedUser?.shopId))
    const [qrOpen, setQrOpen] = useState(false)

    return (
        <Space direction='vertical' className='w-100' wrap>
            <QrReaderModal isModalOpen={qrOpen} closeModal={() => setQrOpen(false)} />
            <Space wrap className='w-100 justify-between'>
                <h2>Dashboard</h2>
                <DashboardFilters {...{ filter, setFilter }} />
            </Space>
            <div className={'dashboard-items'}>
                <Button onClick={() => setQrOpen(true)}>Read QR</Button>
                <ActiveTickets filter={filter} />
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
        <Space wrap>
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
            <DateTimeFilter
                filter={filter}
                setFilter={setFilter}
                dataKeys={{ before: 'createdBefore', after: 'createdAfter' }}
            />
        </Space>
    )
}
