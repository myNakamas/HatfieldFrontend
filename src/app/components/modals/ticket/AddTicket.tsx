import { CreateTicket } from '../../../models/interfaces/ticket'
import React, { useContext } from 'react'
import { EditTicketForm } from './EditTicketForm'
import { defaultTicket } from '../../../models/enums/defaultValues'
import { Modal } from 'antd'
import { useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { createTicket } from '../../../axios/http/ticketRequests'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { AuthContext } from '../../../contexts/AuthContext'

export const AddTicket = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const queryClient = useQueryClient()
    const { isWorker } = useContext(AuthContext)
    if (!isWorker()) return <></>
    const onSubmit = (formValue: CreateTicket) => {
        return toast
            .promise(createTicket({ ticket: formValue }), toastCreatePromiseTemplate('ticket'), toastProps)
            .then(() => {
                queryClient.invalidateQueries(['tickets']).then(() => closeModal())
            })
    }
    return (
        <Modal
            title='Create Ticket'
            open={isModalOpen}
            closable
            footer={<></>}
            width={'clamp(400px,80%,900px)'}
            onCancel={closeModal}
        >
            <EditTicketForm
                ticket={defaultTicket}
                onComplete={onSubmit}
                onCancel={() => {
                    closeModal()
                }}
            />
        </Modal>
    )
}
