import React, { useContext } from 'react'
import { EditTicketForm } from './EditTicketForm'
import { defaultTicket } from '../../../models/enums/defaultValues'
import { Modal } from 'antd'
import { AuthContext } from '../../../contexts/AuthContext'
import { TicketForm } from './TicketForm'

export const AddTicket = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const { isWorker } = useContext(AuthContext)
    if (!isWorker()) return <></>

    return (
        <Modal
            title='Create Ticket'
            open={isModalOpen}
            closable
            footer={<></>}
            width={'clamp(400px,80%,900px)'}
            onCancel={closeModal}
        >
            <TicketForm
                ticket={defaultTicket}
                closeModal={closeModal}
                isEdit={false}
            />
        </Modal>
    )
}
