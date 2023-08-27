import { InventoryItem } from '../../models/interfaces/shop'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { Breadcrumb, Button, Divider, Input, Popconfirm, Popover, Space, Statistic } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpToLine, faArrowUp, faCheck, faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect, useState } from 'react'
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons/faBasketShopping'
import { useQuery, useQueryClient } from 'react-query'
import {
    addItemCount,
    deleteDefectiveItem,
    exchangeDefectiveItem,
    getShoppingList,
} from '../../axios/http/shopRequests'
import { InventoryFilter } from '../../models/interfaces/filters'
import { useNavigate, useParams } from 'react-router-dom'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'

export const ShoppingListView = () => {
    const { shopId } = useParams()
    const navigate = useNavigate()
    let queryClient = useQueryClient()
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()
    const [defectiveItems, setDefectiveItems] = useState<InventoryItem[]>([])
    const filter: InventoryFilter = { shopId: Number(shopId) }
    const { data: shoppingList, isLoading } = useQuery(
        ['shopItems', 'shoppingList', filter],
        () => getShoppingList({ filter }),
        {
            suspense: true,
        }
    )
    useEffect(() => {
        if (selectedItem) setSelectedItem((item) => shoppingList?.items.find(({ id }) => item?.id === id) ?? item)
        setDefectiveItems(
            shoppingList?.items.filter(
                (item) => item.requiredItem?.defectiveAmount && item.requiredItem?.defectiveAmount > 0
            ) ?? []
        )
    }, [shoppingList])
    const addItem = (id: number, count: number) => {
        toast
            .promise(addItemCount({ itemId: id, count }), toastUpdatePromiseTemplate('item count'), toastProps)
            .then(() => queryClient.invalidateQueries('shopItems'))
    }

    const resolveDefectiveItem = (item: InventoryItem) => {
        toast
            .promise(exchangeDefectiveItem({ itemId: item.id }), toastUpdatePromiseTemplate('item count'), toastProps)
            .then(() => queryClient.invalidateQueries('shopItems'))
    }

    const removeDefectiveItem = (item: InventoryItem) => {
        toast
            .promise(deleteDefectiveItem({ itemId: item.id }), toastUpdatePromiseTemplate('item count'), toastProps)
            .then(() => queryClient.invalidateQueries('shopItems'))
    }

    const AddCount = ({ missingCount, itemId }: { itemId: number; missingCount: number }) => {
        const [count, setCount] = useState(1)
        return (
            <Popconfirm
                title={'Select count to add'}
                onConfirm={() => {
                    addItem(itemId, count)
                }}
                description={
                    <Space>
                        <Input type='number' value={count} onInput={(e) => setCount(+e.currentTarget.value)} />
                        <Button onClick={() => setCount(missingCount)}>All</Button>
                    </Space>
                }
            >
                <Button title={'Buy multiple'} icon={<FontAwesomeIcon icon={faArrowsUpToLine} />} />
            </Popconfirm>
        )
    }

    return (
        <div className={'mainScreen'}>
            <Breadcrumb
                items={[
                    { title: <a onClick={() => navigate('/home')}>Home</a> },
                    { title: <a onClick={() => navigate('/inventory')}>Inventory</a> },
                    { title: 'Shopping list' },
                ]}
            />
            <ViewInventoryItem inventoryItem={selectedItem} closeModal={() => setSelectedItem(undefined)} />
            <Divider>
                <Space>
                    Shopping list <FontAwesomeIcon icon={faBasketShopping} size={'2xl'} />
                    <Button icon={<FontAwesomeIcon icon={faPen} />} onClick={() => navigate('/inventory/required')} />
                </Space>
            </Divider>
            {shoppingList ? (
                <>
                    <CustomTable<InventoryItem>
                        headers={{
                            name: 'Name',
                            count: 'Current count in shop',
                            missingCount: 'Number of items to buy',
                            price: 'Price',
                            action: 'Actions',
                        }}
                        data={shoppingList?.items.map((item) => ({
                            ...item,
                            ...item.requiredItem,
                            price: item.purchasePrice ? (
                                item.purchasePrice * item?.missingCount
                            ) : (
                                <Popover content={'Purchase price of item is not specified'}>Unknown</Popover>
                            ),
                            action: (
                                // <Button icon={<FontAwesomeIcon icon={faPen} />} onClick={() => setSelectedItem(item)} />
                                <Space>
                                    <Button
                                        title={'Buy one'}
                                        icon={<FontAwesomeIcon icon={faArrowUp} />}
                                        onClick={() => addItem(item.id, 1)}
                                    />
                                    <AddCount itemId={item.id} missingCount={item.missingCount} />
                                </Space>
                            ),
                        }))}
                        onClick={setSelectedItem}
                    />
                </>
            ) : (
                <NoDataComponent items={'items in shopping list'} />
            )}
            {defectiveItems?.length > 0 && (
                <>
                    <Divider>Defective items</Divider>

                    <CustomTable<InventoryItem>
                        headers={{
                            name: 'Name',
                            defectiveAmount: 'Defective count',
                            action: 'Actions',
                        }}
                        data={defectiveItems.map((item) => ({
                            ...item,
                            ...item.requiredItem,
                            action: (
                                <Space>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faCheck} />}
                                        onClick={() => resolveDefectiveItem(item)}
                                    />
                                    <Button
                                        icon={<FontAwesomeIcon icon={faXmark} />}
                                        onClick={() => removeDefectiveItem(item)}
                                    />
                                </Space>
                            ),
                        }))}
                        onClick={setSelectedItem}
                    />
                </>
            )}
            <Space className={'w-100 align-start justify-start'}>
                <Statistic
                    prefix={'£'}
                    title={'Total price:'}
                    loading={isLoading}
                    value={shoppingList?.totalPrice}
                    precision={2}
                />
            </Space>
        </div>
    )
}
