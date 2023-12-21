import { Log } from '../models/interfaces/shop'
import { defaultPage, defaultPageSizeOptions, getDefaultPageSize } from '../models/enums/defaultValues'
import React, { Suspense, useContext, useState } from 'react'
import { Filter, LogsFilter } from '../models/interfaces/filters'
import { useQuery } from 'react-query'
import { getAllLogs, getWorkerShops } from '../axios/http/shopRequests'
import { Input, List, Space } from 'antd'
import { DateTimeFilter } from '../components/filters/DateTimeFilter'
import { ItemPropertyView, PageRequest } from '../models/interfaces/generalModels'
import { InfinitySpin } from 'react-loader-spinner'
import { LogDetails } from '../components/modals/LogDetails'
import { LogType, LogTypeList, LogTypeText } from '../models/enums/logEnums'
import { AuthContext } from '../contexts/AuthContext'
import { LogListRow } from '../components/modals/ticket/DetailedTicketInfoView'
import { AppSelect } from '../components/form/AppSelect'
import { resetPageIfNoValues } from '../utils/helperFunctions'

export const Logs = () => {
    const [page, setPage] = useState(defaultPage)
    const [filter, setFilter] = useState<Filter>({})
    return (
        <div className='mainScreen'>
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
    const { data: logs, isLoading } = useQuery(['logs', filter, page], () => getAllLogs({ filter, page }), {
        suspense: true,
        onSuccess: (logs) => {
            resetPageIfNoValues(logs, setPage)
        },
    })
    const [selectedLog, setSelectedLog] = useState<Log | undefined>()

    return (
        <div className={'p-2'}>
            <LogDetails log={selectedLog} closeModal={() => setSelectedLog(undefined)} isModalOpen={!!selectedLog} />
            <List<Log>
                loading={isLoading}
                dataSource={logs?.content}
                pagination={{
                    total: logs?.totalCount,
                    current: page.page,
                    onChange: (page, pageSize) => setPage({ page, pageSize }),
                    position: 'bottom',
                    pageSizeOptions: defaultPageSizeOptions,
                    defaultPageSize: getDefaultPageSize(),
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
    const { data: shops } = useQuery('shops', getWorkerShops, { enabled: isAdmin() })
    return (
        <Space wrap>
            {isAdmin() && (
                <AppSelect<number, ItemPropertyView>
                    value={filter.shopId}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    onChange={(value) => setFilter({ ...filter, shopId: value ?? undefined })}
                    getOptionLabel={(shop) => shop.value}
                    getOptionValue={(shop) => shop.id}
                />
            )}
            <AppSelect<LogType, ItemPropertyView>
                value={filter.type}
                options={LogTypeList}
                placeholder='Filter by type'
                onChange={(value) => setFilter({ ...filter, type: value ?? undefined })}
                getOptionLabel={(log) => LogTypeText[log.value]}
                getOptionValue={(log) => log.value as LogType}
            />

            <Input
                placeholder='Filter by ticket id'
                value={filter.ticketId}
                onChange={(value) =>
                    setFilter({ ...filter, ticketId: +value.target.value ? +value.target.value : undefined })
                }
                inputMode={'numeric'}
            />
            <DateTimeFilter filter={filter} setFilter={setFilter} />
        </Space>
    )
}
