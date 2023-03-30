import { CreateTicket } from '../../../models/interfaces/ticket'
import React from 'react'
import { EditTicketForm } from './EditTicketForm'
import { defaultTicket } from '../../../models/enums/defaultValues'
import { Modal } from 'antd'

export const AddTicket = ({
    isModalOpen,
    closeModal,
    onComplete,
}: {
    isModalOpen: boolean
    closeModal: () => void
    onComplete: (result: CreateTicket) => Promise<void>
}) => {
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
                onComplete={onComplete}
                onCancel={() => {
                    closeModal()
                }}
            />
        </Modal>
    )
}
