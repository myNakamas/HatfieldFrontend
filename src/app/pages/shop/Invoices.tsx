import React, { useState } from 'react'
import { InventoryItem } from '../../models/interfaces/shop'
import { useNavigate } from 'react-router-dom'
import { Filter } from '../../models/interfaces/filters'
import { PageRequest } from '../../models/interfaces/generalModels'
import { useQuery } from 'react-query'
import { Button } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { getAllInvoices } from '../../axios/http/invoiceRequests'
import { Invoice } from '../../models/interfaces/invoice'

export const Invoices = () => {
    const [selectedItem, setSelectedItem] = useState<Invoice>()
    const navigate = useNavigate()
    const [filter, setFilter] = useState<Filter>({})
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data } = useQuery(['invoices', page, filter], () => getAllInvoices({ page, filter }), {
        keepPreviousData: true,
    })
    // const table = useReactTable({
    //     data:data?.content,
    //     columns:[],
    //     getCoreRowModel: getCoreRowModel(),
    // })
    return (
        <div className='mainScreen'>
            {/*<InvoiceFilters {...{ filter, setFilter }} />*/}
            <div className='button-bar'>
                <Button icon={<FontAwesomeIcon icon={faPlus} />} type='primary'>
                    Add Item
                </Button>
            </div>
            <div className='tableWrapper'>
                {data && data.length > 0 ? (
                    <CustomTable<InventoryItem>
                        data={data}
                        onClick={({ id }) => setSelectedItem(data?.find((row) => row.id === id))}
                        pagination={page}
                        onPageChange={setPage}
                    />
                ) : (
                    <NoDataComponent items='items in inventory'>
                        <Button type='primary'>Create Now</Button>
                    </NoDataComponent>
                )}
            </div>
        </div>
    )
}
