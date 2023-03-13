import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useGetShopItems } from '../../axios/http/shopRequests'
import { PageRequest } from '../../models/interfaces/generalModels'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { AddInventoryItem } from '../../components/modals/AddInventoryItem'
import { InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/ViewInventoryItem'
import { useNavigate } from 'react-router-dom'

export const Inventory = () => {
    const [selectedItem, setSelectedItem] = useState<InventoryItem>()
    const navigate = useNavigate()
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data } = useQuery(['shopItems', { page: page.page }], () => useGetShopItems({ page }), {
        keepPreviousData: true,
    })
    // const table = useReactTable({
    //     data:data?.content,
    //     columns:[],
    //     getCoreRowModel: getCoreRowModel(),
    // })
    return (
        <div className='mainScreen'>
            <AddInventoryItem isModalOpen={createModalIsOpen} closeModal={() => setCreateModalIsOpen(false)} />
            <ViewInventoryItem inventoryItem={selectedItem} closeModal={() => setSelectedItem(undefined)} />
            <div className=' button-bar'>
                <button className='actionButton' onClick={() => setCreateModalIsOpen(true)}>
                    Add Item
                </button>
                <button className='actionButton' onClick={() => navigate('/categories')}>
                    Edit categories
                </button>
            </div>
            <div className='tableWrapper'>
                {data && data.content.length > 0 ? (
                    <CustomTable<InventoryItem>
                        data={data.content.map(({ id, brand, categoryView: { itemType, name }, model, count }) => ({
                            id,
                            brand,
                            itemType,
                            name,
                            model,
                            count,
                        }))}
                        headers={['']}
                        onClick={({ id }) => setSelectedItem(data?.content.find((row) => row.id === id))}
                    />
                ) : (
                    //  todo: Add pagination
                    <NoDataComponent items='items in inventory' />
                )}
            </div>
        </div>
    )
}
