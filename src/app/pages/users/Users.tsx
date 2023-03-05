import React, { useContext, useState } from 'react';
import { useQuery } from 'react-query';
import { CustomTable } from '../../components/table/CustomTable';
import { NoDataComponent } from '../../components/table/NoDataComponent';
import { getAllUsers } from '../../axios/http/userRequests';
import { AddEditUser } from '../../components/modals/AddEditUser';
import { AuthContext } from '../../contexts/AuthContext';
import { User } from '../../models/interfaces/user';

export const Users = () => {
    const { loggedUser } = useContext(AuthContext)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const { data: users } = useQuery('users', getAllUsers)

    const onSubmit = (user: User) => {
        console.log(user)
        return Promise.reject('')
    }

    return (
        <div>
            <AddEditUser
                isModalOpen={modalIsOpen}
                closeModal={() => setModalIsOpen(false)}
                variation={loggedUser?.role === 'ADMIN' ? 'FULL' : 'PARTIAL'}
                onComplete={onSubmit}
            />
            <div className='flex-100'>
                <button className='actionButton' onClick={() => setModalIsOpen(true)}>
                    Add Worker
                </button>
            </div>
            {users && users.length > 0 ? <CustomTable data={users} /> : <NoDataComponent items='items in inventory' />}
        </div>
    )
}
