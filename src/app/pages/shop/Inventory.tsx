import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useGetShopItems } from '../../axios/shopRequests'
import { PageRequest } from '../../models/interfaces/generalModels'
import { InventoryItem } from '../../models/interfaces/shop'

export const Inventory = () => {
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data } = useQuery(['shopItems', page.page], () => useGetShopItems({ page }), { keepPreviousData: true })
    // const table = useReactTable({
    //     data:data?.content,
    //     columns,
    //     getCoreRowModel: getCoreRowModel(),
    // })
    return <div>{data ? <Table data={data.content} /> : <></>}</div>
    //    todo: Add pagination
}

const Table = ({ data }: { data: InventoryItem[] }) => {
    return (
        <table>
            <thead>
                <tr>
                    {Object.entries(data[0]).map(([key]) => (
                        <th>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row) => {
                    return Object.entries(row).map(([key, value]) => <td>{value}</td>)
                })}
            </tbody>
        </table>
    )
}
