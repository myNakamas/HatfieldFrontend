import React, { useContext, useRef, useState } from 'react'
import { EditTicketForm } from './EditTicketForm'
import { defaultTicket } from '../../../models/enums/defaultValues'
import { Divider, Modal } from 'antd'
import { AuthContext } from '../../../contexts/AuthContext'
import { TicketForm } from './TicketForm'
import { CreateTicket, Ticket } from '../../../models/interfaces/ticket'
import { TicketSchema } from '../../../models/validators/FormValidators'
import { toast } from 'react-toastify'
import { createTicket, updateTicket } from '../../../axios/http/ticketRequests'
import { putPrintTicketLabels } from '../../../axios/http/documentRequests'
import { AppError } from '../../../models/interfaces/generalModels'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useQueryClient } from 'react-query'
import { usePrintConfirm } from '../PrintConfirm'
import dateFormat from 'dateformat'

export const EditTicket = ({ isModalOpen, closeModal, ticket }: { isModalOpen: boolean; closeModal: () => void, ticket:Ticket }) => {
    const { isWorker } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const [formStatus, setFormStatus] = useState('')


    if (!isWorker()) return <></>

    const form = useForm<CreateTicket>({ defaultValues: ticket, resolver: yupResolver(TicketSchema) })
    const formRef = useRef<HTMLFormElement>(null)

    const onCancel = () => {
        form.reset(defaultTicket)
        formRef.current?.reset();
        closeModal()
    }


    const onFormSubmit = (data: CreateTicket) => {
        setFormStatus('loading')
        editTicket(data)
            .then(() => {
                return queryClient.invalidateQueries(['tickets'])
            })
            .then(() => {
                closeModal();
            })
            .catch((error: AppError) => {
                form.setError('root', { message: error?.detail })
            })
            .finally(() => setFormStatus(''))
    }
    const editTicket = (formValue: CreateTicket) => {
        return updateTicket({ id: ticket?.id, ticket: formValue })
    }



    return (
        <Modal
            title='Edit Ticket'
            open={isModalOpen}
            closable
            centered
            className='ticketModal'
            width={'clamp(400px,80%,900px)'}
            onCancel={closeModal}
            onOk={form.handleSubmit(onFormSubmit)}
            okText='Save changes'
        >
            <TicketForm
                            formRef={formRef}
                form={form}
                formStatus={formStatus}
                ticket={defaultTicket}
                onSubmit={onFormSubmit}
                onCancel={onCancel}
            />
        </Modal>
    )
}