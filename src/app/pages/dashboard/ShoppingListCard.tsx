import { Button, Card, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CustomSuspense } from '../../components/CustomSuspense'
import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { ViewTicket } from '../../components/modals/ticket/ViewTicket'
import { AddTicket } from '../../components/modals/ticket/AddTicket'
import { Ticket } from '../../models/interfaces/ticket'
import { getShoppingList } from '../../axios/http/shopRequests'
import { AuthContext } from '../../contexts/AuthContext'
import { CustomTable } from '../../components/table/CustomTable'
import { InventoryItem } from '../../models/interfaces/shop'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { faShoppingBasket } from '@fortawesome/free-solid-svg-icons/faShoppingBasket'

export const ShoppingListCard = () => {
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const { data: items, isLoading } = useQuery(['shopItems', 'shoppingList'], () =>
        getShoppingList({ filter: { inShoppingList: true, shopId: loggedUser?.shopId } })
    )
    return (
        <Card
            style={{ minWidth: 250 }}
            title={
                <Space>
                    <FontAwesomeIcon icon={faShoppingBasket} /> Shopping list
                </Space>
            }
            extra={
                <Space>
                    <Button type='link' onClick={() => navigate('/inventory/required')} children={'See more'} />
                </Space>
            }
        >
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewTicketModal} closeModal={() => setShowNewTicketModal(false)} />
            <CustomSuspense isReady={!isLoading}>
                {items ? (
                    <CustomTable<InventoryItem>
                        headers={{
                            name: 'Name',
                            count: 'Current count in shop',
                            missingCount: 'Number of items to buy',
                        }}
                        data={items.map((item) => ({
                            ...item,
                            ...item.requiredItem,
                            missingCount: Math.max((item.requiredItem?.requiredAmount ?? item.count) - item.count, 0),
                        }))}
                    />
                ) : (
                    <NoDataComponent items={'items in shopping list'} />
                )}
            </CustomSuspense>
        </Card>
    )
}
