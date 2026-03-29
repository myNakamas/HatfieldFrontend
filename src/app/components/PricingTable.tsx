import { Button, Popconfirm, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Pricing } from '../pages/pricing/types'
import { currencyFormat } from '../utils/helperFunctions'

interface Props {
    data: Pricing[]
    onEdit: (record: Pricing) => void
    onDelete: (id: number) => void
    loading: boolean
}

export const PricingTable = ({ data, onEdit, onDelete, loading }: Props) => {
    const columns: ColumnsType<Pricing> = [
        { title: 'Device Type', dataIndex: 'deviceType' },
        { title: 'Brand', dataIndex: 'brand' },
        { title: 'Model', dataIndex: 'model' },
        { title: 'Issue', dataIndex: 'issue' },
        { title: 'Price', dataIndex: 'price', render: (price: number) => currencyFormat(price) },
        {
            title: 'Original Price',
            dataIndex: 'originalPrice',
            render: (price: number | null) => price !== null ? currencyFormat(price) : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => onEdit(record)}>Edit</Button>
                    <Popconfirm title='Delete this pricing?' onConfirm={() => onDelete(record.id!)}>
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return <Table columns={columns} dataSource={data} rowKey='id' loading={loading} />
}