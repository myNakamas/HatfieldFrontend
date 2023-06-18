import React, { useContext, useState } from 'react'
import { InventoryFilter } from '../../models/interfaces/filters'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'
import { useQuery, useQueryClient } from 'react-query'
import { changeMultipleNeed, changeNeed, getShoppingList, useGetShopItems } from '../../axios/http/shopRequests'
import { Breadcrumb, Button, Space, Statistic, Table, Transfer } from 'antd'
import { TransferDirection } from 'antd/es/transfer'
import { defaultPage } from '../../models/enums/defaultValues'
import { TableRowSelection } from 'antd/es/table/interface'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faListCheck, faPen } from '@fortawesome/free-solid-svg-icons'
import { EditRequiredItem } from '../../components/modals/inventory/EditRequiredItem'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { toast } from 'react-toastify'

const getInventoryItemKey = (item: InventoryItem) => String(item.id)
const nonRequiredColumns = [
    { dataIndex: 'name', title: 'Name' },
    { dataIndex: 'count', title: 'Current Count' },
    { dataIndex: 'requiredAmount', title: 'Needed Count' },
    { dataIndex: 'action', title: 'Actions' },
]
const requiredColumns = [
    { dataIndex: 'name', title: 'Name' },
    { dataIndex: 'count', title: 'Current Count' },
    { dataIndex: 'requiredAmount', title: 'Needed Count' },
    { dataIndex: 'missingCount', title: 'Missing amount' },
    { dataIndex: 'requiredReason', title: 'Reason' },
    { dataIndex: 'status', title: 'Status' },
    { dataIndex: 'action', title: 'Actions' },
]

export interface ItemRequest {
    itemId: string
    count: number
}

export const EditShoppingList = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [page, setPage] = useState(defaultPage)
    const [filter, setFilter] = useState<InventoryFilter>({ shopId: loggedUser?.shopId })
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()
    const [editRequiredItem, setEditRequiredItem] = useState<InventoryItem | undefined>()
    const { data: allItems } = useQuery(['shopItems', page, filter], () => useGetShopItems({ page, filter }), {
        suspense: true,
    })
    const { data: shoppingList, isLoading } = useQuery(
        ['shopItems', 'shoppingList', filter],
        () => getShoppingList({ filter }),
        {
            suspense: true,
        }
    )

    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    const onChange = (nextTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
        toast
            .promise(
                changeMultipleNeed({ ids: moveKeys, isNeeded: direction === 'right' }),
                toastUpdatePromiseTemplate('status'),
                toastProps
            )
            .then(() => queryClient.invalidateQueries(['shopItems']))
    }

    const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys])
    }

    const updateNeeded = (id: any, isNeeded: boolean) => {
        toast
            .promise(changeNeed({ id, isNeeded }), toastUpdatePromiseTemplate('status'), toastProps)
            .then(() => queryClient.invalidateQueries(['shopItems']))
    }

    return (
        <div className='mainScreen'>
            <ViewInventoryItem inventoryItem={selectedItem} closeModal={() => setSelectedItem(undefined)} />
            <EditRequiredItem inventoryItem={editRequiredItem} closeModal={() => setEditRequiredItem(undefined)} />
            <Breadcrumb>
                <Breadcrumb.Item>
                    <a onClick={() => navigate('/home')}>Home</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <a onClick={() => navigate('/inventory')}>Inventory</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Shopping list</Breadcrumb.Item>
            </Breadcrumb>
            <Space className={'button-bar'}>
                <Button
                    icon={<FontAwesomeIcon icon={faListCheck} />}
                    onClick={() => navigate(`/inventory/${filter.shopId}/shopping-list`)}
                >
                    View the shopping list
                </Button>
            </Space>
            <Transfer<InventoryItem>
                dataSource={allItems?.content}
                titles={['Not needed items', 'Shopping list']}
                rowKey={getInventoryItemKey}
                targetKeys={shoppingList?.items.map(getInventoryItemKey)}
                selectedKeys={selectedKeys}
                onChange={onChange}
                onSelectChange={onSelectChange}
            >
                {({
                    direction,
                    filteredItems,
                    onItemSelectAll,
                    onItemSelect,
                    selectedKeys: listSelectedKeys,
                    disabled: listDisabled,
                }) => {
                    const required = direction === 'right'
                    const rowSelection: TableRowSelection<InventoryItem> = {
                        onSelectAll(selected, selectedRows) {
                            onItemSelectAll(selectedRows.map(getInventoryItemKey), selected)
                        },
                        onSelect({ id }, selected) {
                            onItemSelect(String(id), selected)
                        },
                        selectedRowKeys: listSelectedKeys,
                    }
                    const items = filteredItems.map((item) => ({
                        ...item,
                        ...item.requiredItem,
                        missingCount: Math.max((item.requiredItem?.requiredAmount ?? item.count) - item.count, 0),
                        action: (
                            <Space>
                                <Button
                                    icon={<FontAwesomeIcon icon={faPen} />}
                                    onClick={() => setEditRequiredItem(item)}
                                />
                                {required &&
                                    item.requiredItem?.requiredAmount &&
                                    item.count < item.requiredItem?.requiredAmount && (
                                        <Button
                                            icon={<FontAwesomeIcon icon={faArrowLeft} />}
                                            onClick={() => {
                                                updateNeeded(item.id, false)
                                            }}
                                        >
                                            Mark as not required
                                        </Button>
                                    )}
                                {!required &&
                                    item.requiredItem?.requiredAmount &&
                                    item.count < item.requiredItem?.requiredAmount && (
                                        <Button
                                            icon={<FontAwesomeIcon icon={faArrowRight} />}
                                            onClick={() => {
                                                updateNeeded(item.id, true)
                                            }}
                                        >
                                            Mark as required
                                        </Button>
                                    )}
                            </Space>
                        ),
                    }))
                    return (
                        <Table<InventoryItem>
                            rowSelection={rowSelection}
                            scroll={{ x: true, scrollToFirstRowOnChange: true }}
                            columns={(direction === 'left' ? nonRequiredColumns : requiredColumns).map(
                                (item, index) => ({ ...item, key: index })
                            )}
                            dataSource={items}
                            size='small'
                            style={{ pointerEvents: listDisabled ? 'none' : undefined }}
                            onRow={(item) => ({
                                onDoubleClick: () => {
                                    setSelectedItem(item)
                                },
                            })}
                            pagination={{
                                showSizeChanger: true,
                                pageSize: page.pageSize,
                                onChange: (page, pageSize) => setPage({ page, pageSize }),
                            }}
                        />
                    )
                }}
            </Transfer>
            <Statistic title={'Total price:'} loading={isLoading} value={shoppingList?.totalPrice} precision={2} />
        </div>
    )
}
