import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getAllBrands, getAllCategories, getAllModels, useGetShopItems } from '../../axios/http/shopRequests'
import { ItemPropertyView, PageRequest } from '../../models/interfaces/generalModels'
import { InventoryFilter } from '../../models/interfaces/filters'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { AddInventoryItem } from '../../components/modals/inventory/AddInventoryItem'
import { Category, InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'
import { useNavigate } from 'react-router-dom'
import { SearchComponent } from '../../components/filters/SearchComponent'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { AuthContext } from '../../contexts/AuthContext'
import { Button } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faFileEdit, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { EditInventoryItem } from '../../components/modals/inventory/EditInventoryItem'

export const Inventory = () => {
    const [editItem, setEditItem] = useState<InventoryItem>()
    const [selectedItem, setSelectedItem] = useState<InventoryItem>()
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<InventoryFilter>({ shopId: loggedUser?.shopId })
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data } = useQuery(['shopItems', page, filter], () => useGetShopItems({ page, filter }), {
        keepPreviousData: true,
    })
    return (
        <div className='mainScreen'>
            <InventoryFilters {...{ filter, setFilter }} />
            <AddInventoryItem isModalOpen={createModalIsOpen} closeModal={() => setCreateModalIsOpen(false)} />
            <EditInventoryItem isModalOpen={!!editItem} item={editItem} closeModal={() => setEditItem(undefined)} />
            <ViewInventoryItem
                inventoryItem={selectedItem}
                closeModal={() => setSelectedItem(undefined)}
                openEditModal={(item) => setEditItem(item)}
            />
            <div className='button-bar'>
                <Button
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    type='primary'
                    onClick={() => setCreateModalIsOpen(true)}
                >
                    Add Item
                </Button>
                <Button
                    icon={<FontAwesomeIcon icon={faFileEdit} />}
                    type='primary'
                    onClick={() => navigate('/categories')}
                >
                    Edit categories
                </Button>
                <Button
                    icon={<FontAwesomeIcon icon={faShoppingCart} />}
                    type='primary'
                    onClick={() => navigate('/categories')}
                >
                    Shopping List
                </Button>
                <Button disabled type='primary' onClick={() => navigate('/categories')}>
                    Return List
                </Button>
            </div>
            <div className='tableWrapper'>
                {data && data.content.length > 0 ? (
                    <CustomTable<InventoryItem>
                        data={data.content.map((item) => ({
                            ...item,
                            brand: item.brand,
                            model: item.model,
                            type: item.categoryView?.itemType ?? '-',
                            category: item.categoryView?.name ?? '-',
                            count: item.count,
                            actions: (
                                <Button onClick={() => setEditItem(item)} icon={<FontAwesomeIcon icon={faPen} />} />
                            ),
                        }))}
                        headers={{
                            brand: 'Brand',
                            model: 'Model',
                            type: 'Item type',
                            category: 'Category',
                            count: 'Count',
                            actions: 'Actions',
                        }}
                        onClick={({ id }) => setSelectedItem(data?.content.find((row) => row.id === id))}
                        pagination={page}
                        onPageChange={setPage}
                    />
                ) : (
                    <NoDataComponent items='items in inventory'>
                        <Button type='primary' onClick={() => setCreateModalIsOpen(true)}>
                            Create Now
                        </Button>
                    </NoDataComponent>
                )}
            </div>
        </div>
    )
}

const InventoryFilters = ({
    filter,
    setFilter,
}: {
    filter: InventoryFilter
    setFilter: (value: ((prevState: InventoryFilter) => InventoryFilter) | InventoryFilter) => void
}) => {
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: categories } = useQuery('allCategories', getAllCategories)

    return (
        <div className='filterRow'>
            <SearchComponent {...{ filter, setFilter }} />
            <div className='filterField'>
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={models?.find(({ id }) => filter.modelId === id)}
                    options={models ?? []}
                    placeholder='Filter by model'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, modelId: value?.id ?? undefined })}
                    getOptionLabel={(model) => model.value}
                    getOptionValue={(model) => String(model.id)}
                />
            </div>
            <div className='filterField'>
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={brands?.find(({ id }) => filter.brandId === id)}
                    options={brands ?? []}
                    placeholder='Filter by brand'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, brandId: value?.id ?? undefined })}
                    getOptionLabel={(brand) => brand.value}
                    getOptionValue={(brand) => String(brand.id)}
                />
            </div>
            <div className='filterField'>
                <Select<Category, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={categories?.find(({ id }) => filter.categoryId === id)}
                    options={categories ?? []}
                    placeholder='Filter by category'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, categoryId: value?.id ?? undefined })}
                    getOptionLabel={(category) => category.name}
                    getOptionValue={(category) => String(category.id)}
                />
            </div>
        </div>
    )
}
