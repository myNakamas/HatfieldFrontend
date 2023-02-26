import React, { useState } from "react";
import { useQuery } from "react-query";
import { useGetShopItems } from "../../axios/shopRequests";
import { PageRequest } from "../../models/interfaces/generalModels";
import { CustomTable } from "../../components/table/CustomTable";
import { NoDataComponent } from "../../components/table/NoDataComponent";
import { AddInventoryItem } from "../../components/modals/AddInventoryItem";

export const Inventory = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 1 })
    const { data } = useQuery(['shopItems', page.page], () => useGetShopItems({ page }), { keepPreviousData: true })
    // const table = useReactTable({
    //     data:data?.content,
    //     columns,
    //     getCoreRowModel: getCoreRowModel(),
    // })
    return (
        //todo: Add a way to add new Item to the inventory
        <div className=''>
            <AddInventoryItem isModalOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} />
            <div className='flex'>
                <button className='actionButton' onClick={() => setModalIsOpen(true)}>Add Item</button>
            </div>
            {data && data.content.length > 0 ? (
                <CustomTable data={data.content} />
            ) : (
                //  todo: Add pagination
                <NoDataComponent items='items in inventory' />
            )}
        </div>
    )
}
