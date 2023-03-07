import React, { useContext, useState } from 'react';
import { useQuery } from 'react-query';
import { CustomTable } from '../../components/table/CustomTable';
import { NoDataComponent } from '../../components/table/NoDataComponent';
import { createClient, createWorkerUser, getAllUsers } from '../../axios/http/userRequests';
import { AddEditUser } from '../../components/modals/AddEditUser';
import { AuthContext } from '../../contexts/AuthContext';
import { User } from '../../models/interfaces/user';
import { SimpleUserSchema } from '../../models/validators/FormValidators';
import { toast } from 'react-toastify';
import { toastProps } from '../../components/modals/ToastProps';

export const Users = () => {
    const { loggedUser } = useContext(AuthContext)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const { data: users } = useQuery('users', getAllUsers)

    const onSubmit = (value: User) => {
        const user = loggedUser?.role === 'ADMIN' ? value : ({ ...value, shopId: loggedUser?.shopId } as User)
        const promise = user.role === 'CLIENT' ? createClient(user) : createWorkerUser(user)
        toast.promise(
            promise,
            { pending: 'Sending', success: 'User successfully created', error: 'User creation failed' },
            toastProps
        )
        return promise.then(() => setModalIsOpen(false))
    }

    return (
        <div>
            <AddEditUser
                isModalOpen={modalIsOpen}
                closeModal={() => setModalIsOpen(false)}
                variation={loggedUser?.role === 'ADMIN' ? 'FULL' : 'PARTIAL'}
                onComplete={onSubmit}
                validateSchema={SimpleUserSchema}
            />
            <div className='flex-100'>
                <button className='actionButton' onClick={() => setModalIsOpen(true)}>
                    Add Worker
                </button>
            </div>
            {users && users.length > 0 ? (
                <CustomTable data={users} headers={['']} />
            ) : (
                <NoDataComponent items='items in inventory' />
            )}
        </div>
    )
}
