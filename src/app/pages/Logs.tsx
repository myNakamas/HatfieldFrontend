import { Log, Shop } from '../models/interfaces/shop'
import { defaultPage } from '../models/enums/defaultValues'
import React, { Suspense, useContext, useState } from 'react'
import { Filter, LogsFilter } from '../models/interfaces/filters'
import { useQuery } from 'react-query'
import { getAllLogs, getAllShops } from '../axios/http/shopRequests'
import { Input, List, Space } from 'antd'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../styles/components/stylesTS'
import { DateTimeFilter } from '../components/filters/DateTimeFilter'
import { ItemPropertyView, PageRequest } from '../models/interfaces/generalModels'
import { InfinitySpin } from 'react-loader-spinner'
import { LogDetails } from '../components/modals/LogDetails'
import { LogType, LogTypeList } from '../models/enums/logEnums'
import { AuthContext } from '../contexts/AuthContext'
import { LogListRow } from '../components/modals/ticket/DetailedTicketInfoView'

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
    const { data: logs } = useQuery(['logs', filter, page], () => getAllLogs({ filter, page }), { suspense: true })
    const [selectedLog, setSelectedLog] = useState<Log | undefined>()

    return (
        <div className={'p-2'}>
            <LogDetails log={selectedLog} closeModal={() => setSelectedLog(undefined)} isModalOpen={!!selectedLog} />
            <List<Log>
                dataSource={logs?.content}
                pagination={{
                    total: logs?.totalCount,
                    onChange: (page, pageSize) => setPage({ page, pageSize }),
                    position: 'bottom',
                    showSizeChanger: true,
                }}
                renderItem={(log) => <LogListRow onClick={setSelectedLog} log={log} key={'logKey' + log.id} />}
            />
        </div>
    )
}
const LogsFilters = ({
    filter,
    setFilter,
}: {
    filter: LogsFilter
    setFilter: React.Dispatch<React.SetStateAction<LogsFilter>>
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
            <div className='filterField'>
                <Input
                    placeholder='Filter by ticket id'
                    value={filter.ticketId}
                    onChange={(value) =>
                        setFilter({ ...filter, ticketId: +value.target.value ? +value.target.value : undefined })
                    }
                    inputMode={'numeric'}
                />
            </div>
            <DateTimeFilter filter={filter} setFilter={setFilter} />
        </Space>
    )
}
