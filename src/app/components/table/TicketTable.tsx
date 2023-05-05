import React from 'react'
import { Table } from 'antd'
import { CSS } from '@dnd-kit/utilities'
import { Ticket } from '../../models/interfaces/ticket'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { Arguments } from '@dnd-kit/sortable/dist/hooks/useSortable'

interface TicketTableProps {
    onClick?: (value: Ticket) => void
    data: any[]
    onSort: (e: DragEndEvent) => void
}

const headers = {
    id: 'Ticket Id',
    timestamp: 'Creation date',
    deadline: 'Deadline',
    status: 'Ticket status',
    totalPrice: 'Total Price',
    createdBy: 'Created by',
    clientName: 'Client name',
    actions: 'Actions',
}

export const TicketTable = ({ data, onClick, onSort }: TicketTableProps) => {
    const columns = Object.entries(headers).map(([key, value], index) => ({
        title: value,
        dataIndex: String(key),
        key: 'column' + index,
    }))
    const dataSource = data.map((value) => ({ key: value.id, ...value }))
    // noinspection JSUnusedGlobalSymbols
    const getComponentProps = (record: Ticket) => ({
        onDoubleClick: () => {
            if (onClick) {
                onClick(record)
            }
        },
    })
    return (
        <DndContext onDragEnd={onSort}>
            <SortableContext
                // rowKey array
                items={dataSource.map((i) => i.key)}
                strategy={verticalListSortingStrategy}
            >
                <Table<Ticket>
                    dataSource={dataSource}
                    columns={columns}
                    onRow={getComponentProps}
                    components={{
                        body: {
                            row: Row,
                        },
                    }}
                    rowKey='key'
                    pagination={false}
                />
            </SortableContext>
        </DndContext>
    )
}
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string
}
const Row = (props: RowProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    } as Arguments)

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    }

    return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
}
