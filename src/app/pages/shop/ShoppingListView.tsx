import { InventoryItem } from '../../models/interfaces/shop'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { Breadcrumb, Button, Divider, Input, Popconfirm, Popover, Space, Statistic } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpToLine, faArrowUp, faCheck, faPen } from '@fortawesome/free-solid-svg-icons'
import React, { useState } from 'react'
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons/faBasketShopping'
import { useQuery, useQueryClient } from 'react-query'
import { exchangeDefectiveItem, getShoppingList } from '../../axios/http/shopRequests'
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
            onSuccess: ({ items }) => {
                if (selectedItem) setSelectedItem((item) => items.find(({ id }) => item?.id === id) ?? item)
                setDefectiveItems(
                    items.filter((item) => item.requiredItem?.defectiveAmount && item.requiredItem?.defectiveAmount > 0)
                )
            },
        }
    )

    const resolveDefectiveItem = (item: InventoryItem) => {
        toast
            .promise(exchangeDefectiveItem({ itemId: item.id }), toastUpdatePromiseTemplate('item count'), toastProps)
            .then(() => queryClient.invalidateQueries('shopItems'))
    }

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
            <Divider>
                {' '}
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
                                        icon={<FontAwesomeIcon icon={faArrowUp} />}
                                        onClick={() => setSelectedItem(item)}
                                    />
                                    {/*todo: add a way to add multiple*/}
                                    <Popconfirm
                                        title={'Select count to add'}
                                        description={<Input type='number' defaultValue={0} />}
                                    >
                                        <Button icon={<FontAwesomeIcon icon={faArrowsUpToLine} />} />
                                    </Popconfirm>
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
                                <Button
                                    icon={<FontAwesomeIcon icon={faCheck} />}
                                    onClick={() => resolveDefectiveItem(item)}
                                />
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
