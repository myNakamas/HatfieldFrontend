import { Button, Card, Space, Statistic } from 'antd'
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
import { InvoiceFilter } from '../../models/interfaces/filters'

export const ShoppingListCard = ({ filter }: { filter?: InvoiceFilter }) => {
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const { data: shoppingList, isLoading } = useQuery(['shopItems', 'shoppingList', filter], () =>
        getShoppingList({ filter: { ...filter, inShoppingList: true } })
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
                    <Button
                        type='link'
                        onClick={() => navigate(`/inventory/${loggedUser?.shopId}/shopping-list`)}
                        children={'See more'}
                    />
                </Space>
            }
        >
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewTicketModal} closeModal={() => setShowNewTicketModal(false)} />
            <CustomSuspense isReady={!isLoading}>
                {shoppingList ? (
                    <>
                        <CustomTable<InventoryItem>
                            headers={{
                                name: 'Name',
                                count: 'Current count in shop',
                                missingCount: 'Number of items to buy',
                            }}
                            data={shoppingList.items.map((item) => ({
                                ...item,
                                ...item.requiredItem,
                                missingCount: Math.max(
                                    (item.requiredItem?.requiredAmount ?? item.count) - item.count,
                                    0
                                ),
                            }))}
                        />
                        <Statistic
                            title={'Total price:'}
                            loading={isLoading}
                            value={shoppingList.totalPrice}
                            precision={2}
                        />
                    </>
                ) : (
                    <NoDataComponent items={'items in shopping list'} />
                )}
            </CustomSuspense>
        </Card>
    )
}
