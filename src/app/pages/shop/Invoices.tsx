import React, { useState } from 'react'
import { InventoryItem } from '../../models/interfaces/shop'
import { useNavigate } from 'react-router-dom'
import { Filter } from '../../models/interfaces/filters'
import { PageRequest } from '../../models/interfaces/generalModels'
import { useQuery } from 'react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { getAllInvoices } from '../../axios/http/invoiceRequests'
import { Invoice } from '../../models/interfaces/invoice'
import dateFormat from 'dateformat'
import { invoiceTypeIcon, paymentMethodIcon } from '../../models/enums/invoiceEnums'

export const Invoices = () => {
    const [selectedItem, setSelectedItem] = useState<Invoice>()
    const navigate = useNavigate()
    const [filter, setFilter] = useState<Filter>({})
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data } = useQuery(['invoices', page, filter], () => getAllInvoices({ page, filter }), {
        keepPreviousData: true,
    })
    return (
        <div className='mainScreen'>
            {/*<InvoiceFilters {...{ filter, setFilter }} />*/}
            <div className='tableWrapper'>
                {data && data.length > 0 ? (
                    <CustomTable<InventoryItem>
                        data={data.map((invoice) => ({
                            ...invoice,
                            type: (
                                <>
                                    <FontAwesomeIcon icon={invoiceTypeIcon[invoice.type]} /> invoice.type
                                </>
                            ),
                            timestamp: dateFormat(invoice.timestamp),
                            price: invoice.totalPrice.toFixed(2),
                            createdBy: invoice.createdBy.fullName,
                            client: invoice.client.fullName,
                            payment: (
                                <>
                                    <FontAwesomeIcon icon={paymentMethodIcon[invoice.paymentMethod]} />{' '}
                                    invoice.paymentMethod
                                </>
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
                        }}
                        onClick={({ id }) => setSelectedItem(data?.find((row) => row.id === id))}
                        pagination={page}
                        onPageChange={setPage}
                    />
                ) : (
                    <NoDataComponent items='items in inventory' />
                )}
            </div>
        </div>
    )
}
