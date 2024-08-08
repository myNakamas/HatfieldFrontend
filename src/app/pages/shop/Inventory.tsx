import React, { Suspense, useContext, useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import {
    getAllBrands,
    getAllCategories,
    getAllModels,
    getWorkerShops,
    useGetShopItems,
} from '../../axios/http/shopRequests'
import { ItemPropertyView, PageRequest } from '../../models/interfaces/generalModels'
import { InventoryFilter } from '../../models/interfaces/filters'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { AddInventoryItem } from '../../components/modals/inventory/AddInventoryItem'
import { Category, InventoryItem } from '../../models/interfaces/shop'
import { ViewInventoryItem } from '../../components/modals/inventory/ViewInventoryItem'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { AuthContext } from '../../contexts/AuthContext'
import { AutoComplete, Button, FloatButton, Input, Skeleton, Space, Tour } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faFileEdit, faPen, faPlus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { EditInventoryItem } from '../../components/modals/inventory/EditInventoryItem'
import { defaultPage } from '../../models/enums/defaultValues'
import { inventoryTourSteps } from '../../models/enums/userEnums'
import { AppSelect } from '../../components/form/AppSelect'
import CheckableTag from 'antd/es/tag/CheckableTag'
import { currencyFormat, resetPageIfNoValues } from '../../utils/helperFunctions'
import { QrReaderButton } from '../../components/modals/QrReaderModal'

export const Inventory = () => {
    const [tourIsOpen, setTourIsOpen] = useState(false)
    const refsArray = Array.from({ length: 3 }, () => useRef(null))
    const [editItem, setEditItem] = useState<InventoryItem>()
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    const [filter, setFilter] = useState<InventoryFilter>({ shopId: loggedUser?.shopId, onlyNonEmpty: true })
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>()

    const isUserFromShop = filter.shopId === loggedUser?.shopId

    return (
        <div className='mainScreen'>
            <div ref={refsArray[0]}>
                <InventoryFilters {...{ filter, setFilter }} />
            </div>
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
            <Tour
                type={'primary'}
                open={tourIsOpen}
                onClose={() => setTourIsOpen(false)}
                steps={inventoryTourSteps(refsArray)}
            />
            <ViewInventoryItem
                inventoryItem={selectedItem}
                closeModal={() => setSelectedItem(undefined)}
                openEditModal={(item) => setEditItem(item)}
            />
            <Space className='button-bar'>
                <Button
                    ref={refsArray[2]}
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    type='primary'
                    disabled={!isUserFromShop}
                    onClick={() => setCreateModalIsOpen(true)}
                >
                    Add Item
                </Button>
                <Button
                    icon={<FontAwesomeIcon icon={faFileEdit} />}
                    type='primary'
                    disabled={!isUserFromShop}
                    onClick={() => navigate('/categories')}
                >
                    Edit categories
                </Button>
                <Button
                    icon={<FontAwesomeIcon icon={faShoppingCart} />}
                    type='primary'
                    disabled={!isUserFromShop}
                    onClick={() => navigate(`/inventory/${loggedUser?.shopId}/shopping-list`)}
                >
                    Shopping List
                </Button>
                <QrReaderButton title={'Scan QR'} />
            </Space>
            <div ref={refsArray[1]}>
                <Suspense fallback={<Skeleton active loading />}>
                    <InventoryInner
                        {...{ setSelectedItem, setEditItem, page, setPage, filter }}
                        openCreateModal={() => setCreateModalIsOpen(true)}
                    />
                </Suspense>
            </div>
            <FloatButton
                tooltip={'Help'}
                onClick={() => setTourIsOpen(true)}
                icon={<FontAwesomeIcon icon={faQuestion} />}
            />
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
    const { isClient } = useContext(AuthContext)
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: categories } = useQuery('allCategories', getAllCategories)
    const { data: shops } = useQuery(['shops', 'short'], getWorkerShops, { enabled: !isClient() })
    const [params] = useSearchParams()

    useEffect(() => {
        const shopId = params.get('shopId')
        const itemId = params.get('itemId')
        if (shopId) setFilter({ shopId: +shopId })
        if (itemId) setFilter({ id: itemId ? +itemId : undefined })
    }, [])

    return (
        <Space wrap className={'w-100 justify-between'}>
            <AutoComplete
            className='mw-200'
                placeholder='Search'
                value={filter.searchBy}
                options={
                    filter.categoryId
                        ? categories
                              ?.find(({ id }) => filter.categoryId == id)
                              ?.columns.map((column) => ({ ...column, value: column.name }))
                        : []
                }
                filterOption
                onSelect={(column) => setFilter({ ...filter, searchBy: column + ':' })}
                onChange={(value) => setFilter({ ...filter, searchBy: value })}
            />
            <Space wrap>
                <CheckableTag
                    checked={filter.onlyNonEmpty ?? false}
                    onChange={(value) => setFilter({ ...filter, onlyNonEmpty: value })}
                >
                    Hide Empty Items
                </CheckableTag>
                <Input
                    placeholder='Search by id'
                    allowClear
                    value={filter.id}
                    onChange={({ target }) => setFilter({ ...filter, id: target.value ? +target.value : undefined })}
                />
                <AppSelect<number, ItemPropertyView>
                    value={filter.shopId}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    onChange={(value) => setFilter({ ...filter, shopId: value ?? undefined })}
                    getOptionLabel={(shop) => shop.value}
                    getOptionValue={(shop) => shop.id}
                />
                <AppSelect<number, ItemPropertyView>
                    value={filter.brandId}
                    options={brands}
                    placeholder='Filter by brand'
                    onChange={(value) => setFilter({ ...filter, brandId: value ?? undefined, modelId: undefined })}
                    getOptionLabel={(shop) => shop.value}
                    getOptionValue={(shop) => shop.id}
                />
                <AppSelect<number, ItemPropertyView>
                    value={filter.modelId}
                    options={filter.brandId ? brands?.find(({ id }) => filter.brandId === id)?.models : models}
                    placeholder='Filter by model'
                    onChange={(value) => setFilter({ ...filter, modelId: value ?? undefined })}
                    getOptionLabel={(shop) => shop.value}
                    getOptionValue={(shop) => shop.id}
                />
                <AppSelect<number, Category>
                    value={filter.categoryId}
                    options={categories}
                    placeholder='Filter by category'
                    onChange={(value) => setFilter({ ...filter, categoryId: value ?? undefined })}
                    getOptionLabel={(category) => category.name}
                    getOptionValue={(category) => category.id}
                />
            </Space>
        </Space>
    )
}

export const InventoryInner = ({
    setSelectedItem,
    setEditItem,
    setPage,
    page,
    filter,
}: {
    filter?: InventoryFilter
    setSelectedItem: React.Dispatch<React.SetStateAction<InventoryItem | undefined>>
    setEditItem: React.Dispatch<React.SetStateAction<InventoryItem | undefined>>
    openCreateModal: () => void
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => {
    const { data } = useQuery(['shopItems', page, filter], () => useGetShopItems({ page, filter }), {
        suspense: true,
        onSuccess: (newItems) => {
            resetPageIfNoValues(newItems, setPage)
            setSelectedItem((item) => newItems.content.find(({ id }) => item?.id === id) ?? item)
        },
    })
    const { loggedUser } = useContext(AuthContext)
    const { data: categories } = useQuery('allCategories', getAllCategories)
    const [additionalHeaders, setAdditionalHeaders] = useState({})

    useEffect(() => {
        const category = categories?.find(({ id }) => filter?.categoryId === id)
        setAdditionalHeaders(
            category?.columns.reduce((obj, field) => {
                return {
                    ...obj,
                    [field.name]: field.name,
                }
            }, {}) ?? {}
        )
    }, [filter?.categoryId])

    return <CustomTable<InventoryItem>
            data={data?.content.map((item) => {
                return {
                    ...item.columns,
                    ...item,
                    itemName: item.name ?? '-',
                    sell: currencyFormat(item.sellPrice),
                    categoryType: item.categoryView?.itemType ?? '-',
                    actions: (
                        <Button
                            aria-label={`Edit item ${item.name}`}
                            onClick={() => setEditItem(item)}
                            icon={<FontAwesomeIcon icon={faPen} />}
                        />
                    ),
                }
            })??[]}
            headers={{
                id: 'Item Id',
                itemName: 'Name',
                sell: 'Price',
                categoryType: 'Item type',
                count: 'Count',
                ...additionalHeaders,
                actions: 'Actions',
            }}
            onClick={({ id }) => setSelectedItem(data?.content.find((row) => row.id === id))}
            pagination={page}
            onPageChange={setPage}
            totalCount={data?.totalCount}
        />
}
