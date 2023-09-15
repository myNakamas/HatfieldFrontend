import { Button, Card, Skeleton, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddTicket } from '../../components/modals/ticket/AddTicket'
import { InvoiceFilter } from '../../models/interfaces/filters'
import { InventoryInner } from '../shop/Inventory'
import { PageRequest } from '../../models/interfaces/generalModels'
import { defaultPage } from '../../models/enums/defaultValues'
import { faStore } from '@fortawesome/free-solid-svg-icons/faStore'

export const InventoryCard = ({ filter }: { filter?: InvoiceFilter }) => {
    const navigate = useNavigate()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const [page, setPage] = useState<PageRequest>(defaultPage)

    return (
        <Card
            style={{ minWidth: 250 }}
            title={
                <Space>
                    <FontAwesomeIcon icon={faStore} /> Inventory
                </Space>
            }
            extra={
                <Space>
                    <Button
                        type='link'
                        onClick={() => navigate(`/inventory?shopId=${filter?.shopId}`)}
                        children={'See more'}
                    />
                </Space>
            }
        >
            <AddTicket isModalOpen={showNewTicketModal} closeModal={() => setShowNewTicketModal(false)} />
            <Suspense fallback={<Skeleton active loading />}>
                <InventoryInner
                    setSelectedItem={() => {}}
                    setEditItem={() => {}}
                    openCreateModal={() => {}}
                    {...{ page, setPage, filter }}
                />
            </Suspense>
        </Card>
    )
}
