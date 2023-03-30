import React, { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getAllBrands, getAllCategories, getAllModels, useGetShopItems } from '../../axios/http/shopRequests'
import { ItemPropertyView, PageRequest } from '../../models/interfaces/generalModels'
import { InventoryFilter } from '../../models/interfaces/filters'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { AddInventoryItem } from '../../components/modals/AddInventoryItem'
import { Category, InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/ViewInventoryItem'
import { useNavigate } from 'react-router-dom'
import { SearchComponent } from '../../components/filters/SearchComponent'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { AuthContext } from '../../contexts/AuthContext'
import { Button } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faFileEdit, faPlus } from '@fortawesome/free-solid-svg-icons'

export const Inventory = () => {
    const [selectedItem, setSelectedItem] = useState<InventoryItem>()
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<InventoryFilter>({ shopId: loggedUser?.shopId })
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data } = useQuery(['shopItems', page, filter], () => useGetShopItems({ page, filter }), {
        keepPreviousData: true,
    })
    // const table = useReactTable({
    //     data:data?.content,
    //     columns:[],
    //     getCoreRowModel: getCoreRowModel(),
    // })
    return (
        <div className='mainScreen'>
            <InventoryFilters {...{ filter, setFilter }} />
            <AddInventoryItem isModalOpen={createModalIsOpen} closeModal={() => setCreateModalIsOpen(false)} />
            <ViewInventoryItem inventoryItem={selectedItem} closeModal={() => setSelectedItem(undefined)} />
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
                        data={data.content.map(({ id, brand, categoryView: { itemType, name }, model, count }) => ({
                            id,
                            brand,
                            itemType,
                            name,
                            model,
                            count,
                        }))}
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
    const { data: categories } = useQuery('categories', getAllCategories)

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