import React, { Suspense, useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { getAllBrands, getAllCategories, getAllModels, useGetShopItems } from '../../axios/http/shopRequests'
import { ItemPropertyView, PageRequest } from '../../models/interfaces/generalModels'
import { InventoryFilter } from '../../models/interfaces/filters'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { AddInventoryItem } from '../../components/modals/inventory/AddInventoryItem'
import { Category, InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchComponent } from '../../components/filters/SearchComponent'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { AuthContext } from '../../contexts/AuthContext'
import { Button, Skeleton, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faFileEdit, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { EditInventoryItem } from '../../components/modals/inventory/EditInventoryItem'
import { defaultPage } from '../../models/enums/defaultValues'

export const Inventory = () => {
    const [editItem, setEditItem] = useState<InventoryItem>()
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<InventoryFilter>({ shopId: loggedUser?.shopId })
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()

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
            <Space className='button-bar'>
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
                    onClick={() => navigate('required')}
                >
                    Shopping List
                </Button>
                <Button disabled type='primary' onClick={() => navigate('/categories')}>
                    Return List
                </Button>
            </Space>
            <div className='tableWrapper'>
                <Suspense fallback={<Skeleton active loading />}>
                    <InventoryInner
                        {...{ setSelectedItem, setEditItem, page, setPage, filter }}
                        openCreateModal={() => setCreateModalIsOpen(true)}
                    />
                </Suspense>
            </div>
        </div>
    )
}

const InventoryInner = ({
    setSelectedItem,
    setEditItem,
    setPage,
    page,
    filter,
    openCreateModal,
}: {
    filter: InventoryFilter
    setSelectedItem: React.Dispatch<React.SetStateAction<InventoryItem | undefined>>
    setEditItem: React.Dispatch<React.SetStateAction<InventoryItem | undefined>>
    openCreateModal: () => void
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => {
    const { data } = useQuery(['shopItems', page, filter], () => useGetShopItems({ page, filter }), { suspense: true })
    const [params] = useSearchParams()

    useEffect(() => {
        if (params.get('itemId')) {
            setSelectedItem(data?.content.find(({ id }) => String(id) === params.get('itemId')))
        }
    }, [])

    return data && data.content.length > 0 ? (
        <CustomTable<InventoryItem>
            data={data.content.map((item) => ({
                ...item,
                name: item.name ?? '-',
                sell: item.sellPrice?.toFixed(2) ?? '-',
                type: item.categoryView?.itemType ?? '-',
                actions: <Button onClick={() => setEditItem(item)} icon={<FontAwesomeIcon icon={faPen} />} />,
            }))}
            headers={{
                name: 'Name',
                sell: 'Price',
                type: 'Item type',
                count: 'Count',
                actions: 'Actions',
            }}
            onClick={({ id }) => setSelectedItem(data?.content.find((row) => row.id === id))}
            pagination={page}
            onPageChange={setPage}
            totalCount={data.totalCount}
        />
    ) : (
        <NoDataComponent items='items in inventory'>
            <Button type='primary' onClick={openCreateModal}>
                Create Now
            </Button>
        </NoDataComponent>
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
                    value={models?.find(({ id }) => filter.modelId === id) ?? null}
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
                    value={brands?.find(({ id }) => filter.brandId === id) ?? null}
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
                    value={categories?.find(({ id }) => filter.categoryId === id) ?? null}
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
