import { AppModal } from '../AppModal'
import { CreateTicket } from '../../../models/interfaces/ticket'
import React from 'react'
import { EditTicketForm } from './EditTicketForm'

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
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
            <h3>Create Ticket</h3>
            <EditTicketForm
                ticket={{} as CreateTicket}
                onComplete={onComplete}
                onCancel={() => {
                    closeModal()
                }}
            />
        </AppModal>
    )
}
