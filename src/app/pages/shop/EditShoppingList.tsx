import React, { useContext, useState } from 'react'
import { InventoryFilter } from '../../models/interfaces/filters'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getShoppingList, setShoppingList, useGetShopItems } from '../../axios/http/shopRequests'
import { Button, Space, Table, Transfer } from 'antd'
import { TransferDirection } from 'antd/es/transfer'
import { defaultPage } from '../../models/enums/defaultValues'
import { TableRowSelection } from 'antd/es/table/interface'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck, faPen } from '@fortawesome/free-solid-svg-icons'
import { EditRequiredItem } from '../../components/modals/inventory/EditRequiredItem'

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
    const { data: neededItems } = useQuery(['shopItems', 'shoppingList', filter], () => getShoppingList({ filter }), {
        suspense: true,
    })
    const { mutate: updateShoppingList } = useMutation(['shoppingList'], setShoppingList, {
        onSuccess: () => queryClient.invalidateQueries(['shopItems']),
    })

    const [selectedKeys, setSelectedKeys] = useState<string[]>([])

    const onChange = (nextTargetKeys: string[], direction: TransferDirection, moveKeys: string[]) => {
        updateShoppingList({ shopId: loggedUser?.shopId, ids: moveKeys, isNeeded: direction === 'right' })
    }

    const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys])
    }

    return (
        <div className='mainScreen'>
            <ViewInventoryItem inventoryItem={selectedItem} closeModal={() => setSelectedItem(undefined)} />
            <EditRequiredItem inventoryItem={editRequiredItem} closeModal={() => setEditRequiredItem(undefined)} />
            <Space className={'button-bar'}>
                <Button icon={<FontAwesomeIcon icon={faListCheck} />} onClick={()=>navigate(`/inventory/${filter.shopId}/shopping-list`)}>
                    View the shopping list
                </Button>
            </Space>
            <Transfer<InventoryItem>
                dataSource={allItems?.content}
                titles={['Not needed items', 'Shopping list']}
                rowKey={getInventoryItemKey}
                targetKeys={neededItems?.map(getInventoryItemKey)}
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
                        action:<Button
                            icon={<FontAwesomeIcon icon={faPen} />}
                            onClick={() => setEditRequiredItem(item)}
                        />
                    }))
                    return (
                        <Table<InventoryItem>
                            rowSelection={rowSelection}
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
        </div>
    )
}
