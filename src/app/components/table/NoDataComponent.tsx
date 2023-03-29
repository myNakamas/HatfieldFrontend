import { Empty } from 'antd'
import { ReactNode } from 'react'

export const NoDataComponent = ({ items, children }: { items: string; children?: ReactNode }) => {
    return <Empty description={<h3>No {items} found</h3>}>{children}</Empty>
}
