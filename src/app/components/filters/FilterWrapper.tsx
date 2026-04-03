import { Card, Space } from 'antd'
import { ReactNode } from 'react'

export const FilterWrapper = ({ title, children }: { children: ReactNode; title?: string }) => {
    return (
        <Card title={title} size={'small'}>
            <Space align={'start'} orientation={'vertical'}>
                {children}
            </Space>
        </Card>
    )
}
