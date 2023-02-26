import React, { useState } from "react";
import { useQuery } from "react-query";
import { CustomTable } from "../../components/table/CustomTable";
import { NoDataComponent } from "../../components/table/NoDataComponent";
import { getAllUsers } from "../../axios/userRequests";
import { AddEditUser } from "../../components/modals/AddEditUser";

export const Users = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const { data: users } = useQuery('users', getAllUsers)
    return (
        <div>
            <AddEditUser isModalOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} />
            <div className='flex'>
                <button className='actionButton' onClick={() => setModalIsOpen(true)}>
                    Add Worker
                </button>
            </div>
            {users && users.length > 0 ? <CustomTable data={users} /> : <NoDataComponent items='items in inventory' />}
        </div>
    )
}
