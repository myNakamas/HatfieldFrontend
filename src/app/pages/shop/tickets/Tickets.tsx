import { CustomSuspense } from '../../../components/CustomSuspense'
import { CustomTable } from '../../../components/table/CustomTable'
import { NoDataComponent } from '../../../components/table/NoDataComponent'
import React, { useState } from 'react'
import { CreateTicket, Ticket } from '../../../models/interfaces/ticket'
import { useQuery, useQueryClient } from 'react-query'
import { PageRequest } from '../../../models/interfaces/generalModels'
import { createTicket, fetchAllTickets } from '../../../axios/http/ticketRequests'
import { AddTicket } from '../../../components/modals/ticket/AddTicket'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../../../components/modals/ToastProps'
import dateFormat from 'dateformat'
import { ViewTicket } from '../../../components/modals/ticket/ViewTicket'
import { Pagination } from '../../../components/table/Pagination'

export const Tickets = () => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>()
    const [showNewModal, setShowNewModal] = useState(false)
    const [page, setPage] = useState<PageRequest>({ pageSize: 10, page: 0 })

    const queryClient = useQueryClient()
    const { data, isSuccess } = useQuery(['tickets', page], () => fetchAllTickets({ page }), {
        onSuccess: (data) => {
            setSelectedTicket((ticket) => (ticket ? data.content?.find(({ id }) => ticket.id === id) : undefined))
        },
    })
    const onSubmit = (formValue: CreateTicket) => {
        return toast
            .promise(createTicket({ ticket: formValue }), toastCreatePromiseTemplate('ticket'), toastProps)
            .then(() => {
                queryClient.invalidateQueries(['tickets']).then(() => setShowNewModal(false))
            })
    }

    return (
        <div className='mainScreen'>
            <ViewTicket ticket={selectedTicket} closeModal={() => setSelectedTicket(undefined)} />
            <AddTicket isModalOpen={showNewModal} closeModal={() => setShowNewModal(false)} onComplete={onSubmit} />
            <div className=' button-bar'>
                <button className='actionButton' onClick={() => setShowNewModal(true)}>
                    Add Item
                </button>
            </div>

            <CustomSuspense isReady={isSuccess}>
                {data?.content && data.content.length > 0 ? (
                    <>
                        <div className='tableWrapper'>
                            <CustomTable<Ticket>
                                data={data.content.map(
                                    ({ id, timestamp, deadline, createdBy, client, status, totalPrice }) => ({
                                        id,
                                        'creation date': dateFormat(timestamp),
                                        deadline: deadline ? dateFormat(deadline) : '-',
                                        status,
                                        totalPrice,
                                        createdBy: createdBy?.fullName,
                                        client: client?.fullName,
                                    })
                                )}
                                onClick={({ id }) =>
                                    setSelectedTicket(data?.content.find(({ id: ticketId }) => id === ticketId))
                                }
                            />
                        </div>
                        <Pagination {...{ page, setPage }} pageCount={data.pageCount} />
                    </>
                ) : (
                    <NoDataComponent items='items in inventory' />
                )}
            </CustomSuspense>
        </div>
    )
}
