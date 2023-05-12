import { Log, Shop } from '../models/interfaces/shop'
import { CustomTable } from '../components/table/CustomTable'
import { defaultPage } from '../models/enums/defaultValues'
import React, { Suspense, useState } from 'react'
import { Filter, LogsFilter } from '../models/interfaces/filters'
import { useQuery } from 'react-query'
import { getAllLogs, getAllShops } from '../axios/http/shopRequests'
import { Space } from 'antd'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../styles/components/stylesTS'
import { DateTimeFilter } from '../components/filters/DateTimeFilter'
import { ItemPropertyView, PageRequest } from '../models/interfaces/generalModels'
import dateFormat from 'dateformat'
import { NoDataComponent } from '../components/table/NoDataComponent'
import { InfinitySpin } from 'react-loader-spinner'
import { LogDetails } from '../components/modals/LogDetails'
import { LogType, LogTypeList } from '../models/enums/logEnums'

export const Logs = () => {
    const [page, setPage] = useState(defaultPage)
    const [filter, setFilter] = useState<Filter>({})
    return (
        <div className='mainPage'>
            <Space className='button-bar'>
                <LogsFilters filter={filter} setFilter={setFilter} />
            </Space>
            <Suspense fallback={<InfinitySpin />}>
                <LogsInner {...{ filter, page, setPage }} />
            </Suspense>
        </div>
    )
}

const LogsInner = ({
    filter,
    page,
    setPage,
}: {
    filter: Filter
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => {
    const { data } = useQuery(['logs', filter, page], () => getAllLogs({ filter, page }), { suspense: true })
    const [selectedLog, setSelectedLog] = useState<Log | undefined>()

    return (
        <>
            <LogDetails log={selectedLog} closeModal={() => setSelectedLog(undefined)} isModalOpen={!!selectedLog} />
            {data?.content && data.content.length > 0 ? (
                <CustomTable<Log>
                    data={data.content.map(({ user, timestamp, ...rest }) => ({
                        ...rest,
                        timestamp: dateFormat(timestamp),
                        username: user?.fullName,
                        user,
                    }))}
                    headers={{ action: 'Message', type: 'Log type', username: 'User', timestamp: 'Created at' }}
                    pagination={page}
                    onPageChange={setPage}
                    onClick={setSelectedLog}
                />
            ) : (
                <NoDataComponent items={'logs'} />
            )}
        </>
    )
}
const LogsFilters = ({
    filter,
    setFilter,
}: {
    filter: LogsFilter
    setFilter: React.Dispatch<React.SetStateAction<LogsFilter>>
}) => {
    const { data: shops } = useQuery('shops', getAllShops)
    return (
        <Space>
            <div className='filterField'>
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
            </div>
            <div className='filterField'>
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={LogTypeList.find(({ value }) => value === filter.type) ?? null}
                    options={LogTypeList}
                    placeholder='Filter by type'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, type: value?.value as LogType })}
                    getOptionLabel={(item) => item.value}
                    getOptionValue={(item) => String(item.value)}
                />
            </div>
            <DateTimeFilter filter={filter} setFilter={setFilter} />
        </Space>
    )
}
