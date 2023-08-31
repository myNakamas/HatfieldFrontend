import React, { useContext, useEffect, useState } from 'react'
import { InventoryItem, Shop } from '../../models/interfaces/shop'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { InvoiceFilter } from '../../models/interfaces/filters'
import { ItemPropertyView, PageRequest } from '../../models/interfaces/generalModels'
import { useQuery, useQueryClient } from 'react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { getAllInvoices, getInvoicePdf, invalidateInvoice } from '../../axios/http/invoiceRequests'
import dateFormat from 'dateformat'
import { InvoiceType, invoiceTypeIcon, InvoiceTypesArray, paymentMethodIcon } from '../../models/enums/invoiceEnums'
import { Button, Popconfirm, Skeleton, Space, Switch } from 'antd'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import { getAllBrands, getAllModels, getAllShops } from '../../axios/http/shopRequests'
import { getAllClients, getAllWorkers } from '../../axios/http/userRequests'
import { SearchComponent } from '../../components/filters/SearchComponent'
import { User } from '../../models/interfaces/user'
import { DateTimeFilter } from '../../components/filters/DateTimeFilter'
import { AddInvoice } from '../../components/modals/AddInvoice'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { FormField } from '../../components/form/Field'
import { AuthContext } from '../../contexts/AuthContext'
import { defaultPage } from '../../models/enums/defaultValues'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { QrReaderButton } from '../../components/modals/QrReaderModal'
import { Deadline } from '../../components/modals/ticket/Deadline'
import { AppSelect } from '../../components/form/AppSelect'

export const openInvoicePdf = async (invoiceId: number) => {
    const pdfBlob = await getInvoicePdf(invoiceId)
    if (pdfBlob) {
        const fileUrl = URL.createObjectURL(pdfBlob)
        const pdfPage = window.open(fileUrl)
        if (pdfPage) pdfPage.document.title = 'Hatfield Invoice ' + invoiceId
    }
}
export const Invoices = () => {
    const { isWorker } = useContext(AuthContext)
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const [filter, setFilter] = useState<InvoiceFilter>({ valid: true })
    const [addInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>(defaultPage)
    const { data: invoices, isLoading } = useQuery(['invoices', page, filter], () => getAllInvoices({ page, filter }))

    const queryClient = useQueryClient()
    const onDelete = (id: number) => {
        toast.promise(invalidateInvoice(id), toastUpdatePromiseTemplate('invoice'), toastProps).then(() => {
            queryClient.invalidateQueries(['invoices']).then(() => {
                navigate('/invoices')
            })
        })
    }

    useEffect(() => {
        const invoiceId = params.get('invoiceId')
        if (invoiceId) setFilter({ searchBy: invoiceId })
    }, [])
    return (
        <div className='mainScreen'>
            <Space className={'button-bar justify-between w-100'}>
                <Button
                    type='primary'
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    children='Add a new invoice'
                    onClick={() => setAddInvoiceModalOpen(true)}
                />
                <Space>
                    <QrReaderButton title={'Scan QR code to open invoice'} />
                    <InvoiceFilters {...{ filter, setFilter }} />
                </Space>
            </Space>
            <AddInvoice isModalOpen={addInvoiceModalOpen} closeModal={() => setAddInvoiceModalOpen(false)} />
            <div>
                {isLoading ? (
                    <Skeleton loading />
                ) : invoices && invoices.content.length > 0 ? (
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
                            client: invoice.client?.fullName ?? '-',
                            payment: (
                                <>
                                    <FontAwesomeIcon icon={paymentMethodIcon[invoice.paymentMethod]} />{' '}
                                    {invoice.paymentMethod}
                                </>
                            ),
                            warrantyLeftFormatted: <Deadline deadline={invoice.warrantyLeft} />,
                            actions: (
                                <Space>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faPrint} />}
                                        onClick={() => openInvoicePdf(invoice.id)}
                                    />
                                    {invoice.valid && isWorker() && (
                                        <Popconfirm
                                            title={'Account deletion confirmation'}
                                            description={
                                                'Are you sure you want to delete this invoice? This action is irreversible.'
                                            }
                                            onConfirm={() => {
                                                onDelete(invoice.id)
                                            }}
                                            onCancel={() => toast.success('The invoice was NOT invalidated 😅')}
                                        >
                                            <Button icon={<FontAwesomeIcon icon={faTrash} />}></Button>
                                        </Popconfirm>
                                    )}
                                </Space>
                            ),
                        }))}
                        headers={{
                            type: 'Type',
                            createdBy: 'Created by',
                            timestamp: 'Created at',
                            deviceName: 'Device Brand & Model',
                            price: 'Total price',
                            client: 'Client name',
                            payment: 'Payment method',
                            warrantyLeftFormatted: 'Warranty left',
                            actions: 'Actions',
                        }}
                        totalCount={invoices.totalCount}
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
    const { isWorker, isAdmin } = useContext(AuthContext)
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const { data: users } = useQuery(['users', 'workers'], () => getAllWorkers({}))
    const { data: shops } = useQuery('shops', getAllShops, { enabled: isAdmin() })
    const [advanced, setAdvanced] = useState(false)

    return advanced ? (
        <div className='largeFilter'>
            <div className='filterColumn'>
                <h4>Filters</h4>
                <SearchComponent {...{ filter, setFilter }} />
                <AppSelect<InvoiceType, ItemPropertyView>
                    value={filter.type}
                    options={InvoiceTypesArray}
                    onChange={(value) => setFilter({ ...filter, type: value ?? undefined })}
                    placeholder='Filter by status'
                    getOptionLabel={(status) => status.value}
                    getOptionValue={(status) => status.value as InvoiceType}
                />
            </div>
            <div className='filterColumn' title={'Device filters'}>
                <h4>Device filters</h4>
                <AppSelect<string, ItemPropertyView>
                    value={filter.model}
                    options={models}
                    placeholder='Filter by model'
                    onChange={(value) => setFilter({ ...filter, model: value ?? undefined })}
                    getOptionLabel={(model) => model.value}
                    getOptionValue={(model) => String(model.value)}
                />
                <AppSelect<string, ItemPropertyView>
                    value={filter.brand}
                    options={brands}
                    placeholder='Filter by brand'
                    onChange={(value) => setFilter({ ...filter, brand: value ?? undefined })}
                    getOptionLabel={(brand) => brand.value}
                    getOptionValue={(brand) => String(brand.value)}
                />
            </div>
            <div className='filterColumn' title={'Filter by users'}>
                <h4>Filter by users</h4>
                <AppSelect<string, User>
                    value={filter.clientId}
                    options={clients}
                    placeholder='Filter by client'
                    onChange={(id) => setFilter({ ...filter, clientId: id ?? undefined })}
                    getOptionLabel={(user) => user.username}
                    getOptionValue={(user) => user.userId}
                />
                <AppSelect<string, User>
                    value={filter.createdById}
                    options={users}
                    placeholder='Filter by ticket creator'
                    onChange={(id) => setFilter({ ...filter, createdById: id ?? undefined })}
                    getOptionLabel={(user) => user.username}
                    getOptionValue={(user) => user.userId}
                />
                {isAdmin() && (
                    <AppSelect<number, Shop>
                        value={filter.shopId}
                        options={shops}
                        placeholder='Filter by shop'
                        onChange={(id) => setFilter({ ...filter, shopId: id ?? undefined })}
                        getOptionLabel={(shop) => shop.shopName}
                        getOptionValue={(shop) => shop.id}
                    />
                )}
            </div>
            <div className='filterColumn' title={'Filter by date'}>
                <h4>Filter by date</h4>
                <DateTimeFilter
                    filter={filter}
                    setFilter={({ from, to }) => {
                        setFilter((oldVal) => ({
                            ...oldVal,
                            createdAfter: from?.slice(0, 10) ?? undefined,
                            createdBefore: to?.slice(0, 10) ?? undefined,
                        }))
                    }}
                    placeholder={'Created'}
                />
                <div>
                    <FormField label='Valid invoices filter'>
                        <Switch checked={filter.valid} onChange={(value) => setFilter({ ...filter, valid: value })} />
                    </FormField>
                </div>
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
