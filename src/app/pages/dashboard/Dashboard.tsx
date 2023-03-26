import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { InventoryFilter } from '../../models/interfaces/filters';
import Select from 'react-select';
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS';
import { Shop } from '../../models/interfaces/shop';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { getAllShops } from '../../axios/http/shopRequests';
import { DateTimeFilter } from '../../components/filters/DateTimeFilter';

export const Dashboard = () => {
    const [filter, setFilter] = useState<InventoryFilter>({})

    const data = [
        { uv: 1, pv: 2 },
        { uv: 5, pv: 2 },
        { uv: 3, pv: 1 },
        { uv: 6, pv: 2 },
    ]

    return (
        <div className='mainScreen'>
            <DashboardFilters {...{ filter, setFilter }} />
            <div className='dashboard'>
                <div className='card'>
                    <ResponsiveContainer width={'100%'} height={400}>
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <XAxis dataKey='name' />
                            <Tooltip />
                            <CartesianGrid stroke='#f5f5f5' />
                            <Legend />
                            <Line type='monotone' dataKey='uv' stroke='#ff7300' yAxisId={0} />
                            <Line type='monotone' dataKey='pv' stroke='#387908' yAxisId={1} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className='buttonFooter justify-end'>
                        <button className='actionButton'>See invoices</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const DashboardFilters = ({
    filter,
    setFilter,
}: {
    filter: InventoryFilter
    setFilter: (value: ((prevState: InventoryFilter) => InventoryFilter) | InventoryFilter) => void
}) => {
    const { data: shops } = useQuery('shops', getAllShops)

    return (
        <div className='filterRow'>
            <div className='filterField'>
                <Select<Shop, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={shops?.find(({ id }) => filter.modelId === id)}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, modelId: value?.id ?? undefined })}
                    getOptionLabel={(shop) => shop.shopName}
                    getOptionValue={(shop) => String(shop.id)}
                />
            </div>
            <DateTimeFilter filter={filter} setFilter={setFilter} />
        </div>
    )
}
