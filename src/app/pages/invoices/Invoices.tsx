import React, { useState } from 'react'
import { InventoryItem, Shop } from '../../models/interfaces/shop'
import { useNavigate } from 'react-router-dom'
import { InvoiceFilter } from '../../models/interfaces/filters'
import { ItemPropertyView, PageRequest } from '../../models/interfaces/generalModels'
import { useQuery } from 'react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { getAllInvoices, getInvoicePdf } from '../../axios/http/invoiceRequests'
import dateFormat from 'dateformat'
import { InvoiceType, invoiceTypeIcon, InvoiceTypesArray, paymentMethodIcon } from '../../models/enums/invoiceEnums'
import { Button, Space } from 'antd'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import { getAllBrands, getAllModels, getAllShops } from '../../axios/http/shopRequests'
import { getAllClients, getAllWorkers } from '../../axios/http/userRequests'
import { SearchComponent } from '../../components/filters/SearchComponent'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { User } from '../../models/interfaces/user'
import { DateTimeFilter } from '../../components/filters/DateTimeFilter'

export const Invoices = () => {
    const navigate = useNavigate()
    const [filter, setFilter] = useState<InvoiceFilter>({})
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data: invoices } = useQuery(['invoices', page, filter], () => getAllInvoices({ page, filter }))

    const openPdf = async (invoiceId: number) => {
        const pdfBlob = await getInvoicePdf(invoiceId)
        if (pdfBlob) {
            const fileUrl = URL.createObjectURL(pdfBlob)
            const pdfPage = window.open(fileUrl)
            if (pdfPage) pdfPage.document.title = 'Hatfield Invoice ' + invoiceId
        }
    }
    return (
        <div className='mainScreen'>
            <InvoiceFilters {...{ filter, setFilter }} />
            <div className='tableWrapper'>
                {invoices && invoices.content.length > 0 ? (
                    <CustomTable<InventoryItem>
                        data={invoices.content.map((invoice) => ({
                            ...invoice,
                            type: (
                                <>
                                    <FontAwesomeIcon icon={invoiceTypeIcon[invoice.type]} /> {invoice.type}
                                </>
                            ),
                            timestamp: dateFormat(invoice.timestamp),
                            price: invoice.totalPrice.toFixed(2),
                            createdBy: invoice.createdBy.fullName,
                            client: invoice.client.fullName,
                            payment: (
                                <>
                                    <FontAwesomeIcon icon={paymentMethodIcon[invoice.paymentMethod]} />{' '}
                                    {invoice.paymentMethod}
                                </>
                            ),
                            actions: (
                                <Space>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                        onClick={() => openPdf(invoice.id)}
                                    />
                                </Space>
                            ),
                        }))}
                        headers={{
                            type: 'Invoice type',
                            timestamp: 'Created at',
                            price: 'Total price',
                            createdBy: 'Created by',
                            client: 'Client name',
                            payment: 'Payment method',
                            warrantyPeriod: 'Warranty period',
                            actions: 'Actions',
                        }}
                        onClick={({ id }) => navigate('' + id)}
                        pagination={page}
                        onPageChange={setPage}
                    />
                ) : (
                    <NoDataComponent items='invoices' />
                )}
            </div>
        </div>
    )
}

function InvoiceFilters({
    filter,
    setFilter,
}: {
    filter: InvoiceFilter
    setFilter: React.Dispatch<React.SetStateAction<InvoiceFilter>>
}) {
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    // const { data: locations } = useQuery('locations', getAllLocations)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}))
    const { data: users } = useQuery(['users', 'workers'], () => getAllWorkers({}))
    const { data: shops } = useQuery(['shops'], getAllShops)
    const [advanced, setAdvanced] = useState(false)

    return advanced ? (
        <div className='largeFilter'>
            <div className='filterColumn'>
                <h4>Filters</h4>
                <SearchComponent {...{ filter, setFilter }} />
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={InvoiceTypesArray.find(({ value }) => filter.type === value)}
                    options={InvoiceTypesArray ?? []}
                    placeholder='Filter by status'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, type: value?.value as InvoiceType })}
                    getOptionLabel={(status) => status.value}
                    getOptionValue={(status) => String(status.id)}
                />
            </div>
            <div className='filterColumn' title={'Device filters'}>
                <h4>Device filters</h4>
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={models?.find(({ value }) => filter.model === value)}
                    options={models ?? []}
                    placeholder='Filter by model'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, model: value?.value ?? undefined })}
                    getOptionLabel={(model) => model.value}
                    getOptionValue={(model) => String(model.id)}
                />
                <Select<ItemPropertyView, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={brands?.find(({ value }) => filter.brand === value)}
                    options={brands ?? []}
                    placeholder='Filter by brand'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, brand: value?.value ?? undefined })}
                    getOptionLabel={(brand) => brand.value}
                    getOptionValue={(brand) => String(brand.id)}
                />
            </div>
            <div className='filterColumn' title={'Filter by users'}>
                <h4>Filter by users</h4>
                <Select<User, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={clients?.find(({ userId }) => filter.clientId === userId)}
                    options={clients ?? []}
                    placeholder='Filter by client'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, clientId: value?.userId ?? undefined })}
                    getOptionLabel={(client) => client.username}
                    getOptionValue={(client) => String(client.userId)}
                />
                <Select<User, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={users?.find(({ userId }) => filter.createdById === userId)}
                    options={users ?? []}
                    placeholder='Filter by creator'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, createdById: value?.userId ?? undefined })}
                    getOptionLabel={(user) => user.username}
                    getOptionValue={(user) => String(user.userId)}
                />
                <Select<Shop, false>
                    theme={SelectTheme}
                    styles={SelectStyles()}
                    value={shops?.find(({ id }) => filter.shopId === id)}
                    options={shops ?? []}
                    placeholder='Filter by shop'
                    isClearable
                    onChange={(value) => setFilter({ ...filter, shopId: value?.id ?? undefined })}
                    getOptionLabel={(shop) => shop.shopName}
                    getOptionValue={(shop) => String(shop.id)}
                />
            </div>
            <div className='filterColumn' title={'Filter by date'}>
                <h4>Filter by date</h4>
                <DateTimeFilter
                    filter={filter}
                    setFilter={({ from, to }) => {
                        setFilter((oldVal) => ({
                            ...oldVal,
                            createdAfter: from?.slice(0, 10) ?? oldVal.createdAfter,
                            createdBefore: to?.slice(0, 10) ?? oldVal.createdBefore,
                        }))
                    }}
                    placeholder={'Created'}
                />
            </div>
        </div>
    ) : (
        <div className='flex'>
            <SearchComponent {...{ filter, setFilter }} />
            <Button type={'link'} onClick={() => setAdvanced(true)}>
                Advanced search
            </Button>
        </div>
    )
}
