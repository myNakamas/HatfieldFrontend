import Select from 'react-select'
import { SelectTheme } from '../../styles/components/stylesTS'
import ReactPaginate from 'react-paginate'
import React from 'react'
import { PageRequest } from '../../models/interfaces/generalModels'

export const Pagination = ({
    pageCount,
    page,
    setPage,
}: {
    pageCount?: number
    page: PageRequest
    setPage: React.Dispatch<React.SetStateAction<PageRequest>>
}) => {
    return (
        <div className='pagination'>
            <ReactPaginate
                className='react-paginate'
                pageCount={pageCount ?? 10}
                onPageChange={({ selected }) => setPage({ ...page, page: selected })}
            />
            <div className='flex align-center'>
                <div className='itemsPerPage'>Items per page</div>
                <Select<{ value: number; label: number }, false>
                    theme={SelectTheme}
                    value={{ value: page.pageSize, label: page.pageSize }}
                    options={[5, 10, 20, 50, 100].map((value) => ({ value, label: value }))}
                    onChange={(newValue) => setPage({ page: 0, pageSize: newValue?.value ?? 10 })}
                />
            </div>
        </div>
    )
}
