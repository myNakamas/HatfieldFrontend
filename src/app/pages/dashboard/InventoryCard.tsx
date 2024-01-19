import { Button, Card, Skeleton, Space, Tooltip } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Suspense, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InvoiceFilter } from '../../models/interfaces/filters'
import { InventoryInner } from '../shop/Inventory'
import { PageRequest } from '../../models/interfaces/generalModels'
import { defaultPage } from '../../models/enums/defaultValues'
import { faStore } from '@fortawesome/free-solid-svg-icons/faStore'
import Search from 'antd/es/input/Search'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AuthContext } from '../../contexts/AuthContext'
import { AddInventoryItem } from '../../components/modals/inventory/AddInventoryItem'
import { EditInventoryItem } from '../../components/modals/inventory/EditInventoryItem'
import { InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'

export const InventoryCard = ({ filter }: { filter?: InvoiceFilter }) => {
    const navigate = useNavigate()
    const [editItem, setEditItem] = useState<InventoryItem>()
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const [searchBy, setSearchBy] = useState('')
    const { loggedUser } = useContext(AuthContext)

    const isUserFromShop = filter?.shopId === loggedUser?.shopId

    return (
        <Card
            className='dashboard-card'
            title={
                <Tooltip title='Open Inventory'>

                <Button
                    type='dashed'
                    icon={<FontAwesomeIcon icon={faStore} />}
                    onClick={() => navigate(`/inventory?shopId=${filter?.shopId}`)}
                >
                    Inventory
                </Button>
                </Tooltip>
            }
            extra={
                <Space>
                    <Search allowClear onSearch={setSearchBy} placeholder='Search all items' />
                    <Button
                        aria-label='Create new item'
                        type='primary'
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => setCreateModalIsOpen(true)}
                    />
                </Space>
            }
        >
            {isUserFromShop && (
                <>
                    <AddInventoryItem isModalOpen={createModalIsOpen} closeModal={() => setCreateModalIsOpen(false)} />
                    <EditInventoryItem
                        isModalOpen={!!editItem}
                        item={editItem}
                        closeModal={() => setEditItem(undefined)}
                    />
                </>
            )}
            <ViewInventoryItem
                inventoryItem={selectedItem}
                closeModal={() => setSelectedItem(undefined)}
                openEditModal={(item) => setEditItem(item)}
            />
            <AddInventoryItem isModalOpen={createModalIsOpen} closeModal={() => setCreateModalIsOpen(false)} />
            <Suspense fallback={<Skeleton active loading />}>
                <InventoryInner
                    setSelectedItem={setSelectedItem}
                    setEditItem={setEditItem}
                    openCreateModal={() => setCreateModalIsOpen(true)}
                    {...{ page, setPage, filter: { ...filter, searchBy } }}
                />
            </Suspense>
        </Card>
    )
}
