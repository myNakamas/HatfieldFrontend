import React from 'react'
import { Table } from 'antd'
import { PageRequest } from '../../models/interfaces/generalModels'

interface CustomTableProps<T> {
    headers?: string[]
    onClick?: (value: T) => void
    pagination?: PageRequest
    onPageChange?: (page: PageRequest) => void
    data: any[]
}

export const CustomTable = <T extends object>({ data, onClick, pagination, onPageChange }: CustomTableProps<T>) => {
    const columns = Object.entries(data[0]).map(([key], index) => ({ title: key, dataIndex: key, key: index + key }))
    const getComponentProps = (record: T) => ({
        onClick: () => {
            if (onClick) {
                onClick(record)
            }
        },
    })
    return (
        <Table<T>
            dataSource={data}
            columns={columns}
            onRow={getComponentProps}
            pagination={{
                pageSize: pagination?.pageSize,
                current: pagination?.page,
                onChange: (page, pageSize) => onPageChange && onPageChange({ page, pageSize }),
                pageSizeOptions: [5, 10, 15, 20, 50],
                showSizeChanger: true,
            }}
        />
    )
}
