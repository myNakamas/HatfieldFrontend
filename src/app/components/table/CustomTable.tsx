import React from 'react'
import { Table } from 'antd'
import { PageRequest } from '../../models/interfaces/generalModels'

interface CustomTableProps<T> {
    headers: { [key: string]: string }
    onClick?: (value: T) => void
    pagination?: PageRequest
    onPageChange?: (page: PageRequest) => void
    data: any[]
}

export const CustomTable = <T extends object>({
    data,
    headers,
    onClick,
    pagination,
    onPageChange,
}: CustomTableProps<T>) => {
    const columns = Object.entries(headers).map(([key, value], index) => ({
        title: value,
        dataIndex: String(key),
        key: 'column' + index,
    }))
    // noinspection JSUnusedGlobalSymbols
    const getComponentProps = (record: T) => ({
        onDoubleClick: () => {
            if (onClick) {
                onClick(record)
            }
        },
    })
    return (
        <Table<T>
            dataSource={data.map((value, index) => ({ key: 'dataKey' + index, ...value }))}
            columns={columns}
            onRow={getComponentProps}
            pagination={
                pagination
                    ? {
                          pageSize: pagination?.pageSize,
                          current: pagination?.page,
                          onChange: (page, pageSize) => onPageChange && onPageChange({ page, pageSize }),
                          pageSizeOptions: [5, 10, 15, 20, 50],
                          showSizeChanger: true,
                      }
                    : false
            }
        />
    )
}
