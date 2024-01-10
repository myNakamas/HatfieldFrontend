import React from 'react'
import { Table } from 'antd'
import { PageRequest } from '../../models/interfaces/generalModels'
import { setDefaultPageSize } from '../../models/enums/defaultValues'
import { ColumnsType } from 'antd/es/table'
import type { SortOrder } from 'antd/es/table/interface'

export interface SortParams<T> {
    sortDirection?: SortOrder | null
    sortField?: keyof T | null
}

export interface CustomTableProps<T> {
    headers: { [key: string]: string }
    onClick?: (value: T) => void
    pagination?: PageRequest
    onPageChange?: (page: PageRequest) => void
    data: any[]
    loading?: boolean
    totalCount?: number
    sortableColumns?: string[]
}
export const CustomTable = <T extends object>({
    data,
    headers,
    onClick,
    pagination,
    onPageChange,
    totalCount,
    loading,
    sortableColumns,
}: CustomTableProps<T>) => {
    const columns: ColumnsType<T> = Object.entries(headers).map(([key, value], index) => ({
        title: value,
        dataIndex: String(key),
        key: 'column' + index,
        sorter: sortableColumns?.includes(key),
    }))
    const getComponentProps = (record: T): React.TdHTMLAttributes<any> => ({
        className: onClick ? 'clickable-table-row' : '',
        onClick: (e) => {
            if (onClick && e.target instanceof HTMLTableCellElement) {
                onClick(record)
            }
        },
    })

    return (
        <Table<T>
            dataSource={data.map((value, index) => ({ key: 'dataKey' + index, ...value }))}
            columns={columns}
            scroll={{ x: true, scrollToFirstRowOnChange: true }}
            onRow={getComponentProps}
            loading={loading}
            pagination={
                pagination
                    ? {
                          defaultPageSize: 10,
                          defaultCurrent: 1,
                          pageSize: pagination?.pageSize,
                          current: pagination?.page,
                          pageSizeOptions: [5, 10, 15, 20, 50, 100],
                          position: totalCount && totalCount > 10 ? ['topRight', 'bottomRight'] : ['bottomRight'],
                          showSizeChanger: true,
                          total: totalCount,
                      }
                    : false
            }
            onChange={({ current, pageSize }, _, sorter) => {
                if (onPageChange && current && pageSize) {
                    pageSize && setDefaultPageSize(pageSize)
                    const sortDirection = (sorter instanceof Array ? sorter[0].order : sorter.order) ?? ''
                    const sortField = sorter instanceof Array ? sorter[0].field : sorter.field
                    onPageChange({
                        page: current,
                        pageSize,
                        sortDirection: SortDirectionNames[sortDirection],
                        sortField: sortField + '',
                    })
                }
            }}
        />
    )
}

const SortDirectionNames = {
    descend: 'DESC',
    ascend: 'ASC',
    '': undefined,
}
