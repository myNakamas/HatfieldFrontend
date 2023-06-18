import { InventoryItem } from '../../models/interfaces/shop'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { Breadcrumb, Button, Card, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import React, { useState } from 'react'
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons/faBasketShopping'
import { useQuery } from 'react-query'
import { getShoppingList } from '../../axios/http/shopRequests'
import { InventoryFilter } from '../../models/interfaces/filters'
import { useNavigate, useParams } from 'react-router-dom'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'

export const ShoppingListView = () => {
    const { shopId } = useParams()
    const navigate = useNavigate()
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()
    const filter: InventoryFilter = { shopId: Number(shopId) }
    const { data: items } = useQuery(['shopItems', 'shoppingList', filter], () => getShoppingList({ filter }), {
        suspense: true,
        onSuccess: (newItems) => {
            if (selectedItem) setSelectedItem((item) => newItems.find(({ id }) => item?.id === id) ?? item)
        },
    })

    return (
        <div className={'mainScreen'}>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <a onClick={() => navigate('/home')}>Home</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <a onClick={() => navigate('/inventory')}>Inventory</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Shopping list</Breadcrumb.Item>
            </Breadcrumb>
            <ViewInventoryItem inventoryItem={selectedItem} closeModal={() => setSelectedItem(undefined)} />
            <Card
                title={
                    <Space>
                        Shopping list <FontAwesomeIcon icon={faBasketShopping} size={'2xl'} />
                    </Space>
                }
                extra={<Button icon={<FontAwesomeIcon icon={faPen} />} onClick={() => navigate('/inventory')} />}
            >
                {items ? (
                    <CustomTable<InventoryItem>
                        headers={{
                            name: 'Name',
                            count: 'Current count in shop',
                            missingCount: 'Number of items to buy',
                            action: 'Actions',
                        }}
                        data={items.map((item) => ({
                            ...item,
                            ...item.requiredItem,
                            missingCount: Math.max((item.requiredItem?.requiredAmount ?? item.count) - item.count, 0),
                            action: (
                                <Button icon={<FontAwesomeIcon icon={faPen} />} onClick={() => setSelectedItem(item)} />
                            ),
                        }))}
                        onClick={setSelectedItem}
                    />
                ) : (
                    <NoDataComponent items={'items in shopping list'} />
                )}
            </Card>
        </div>
    )
}
