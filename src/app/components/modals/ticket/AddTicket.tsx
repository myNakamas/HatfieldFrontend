import React, { useContext, useRef, useState } from 'react'
import { EditTicketForm } from './EditTicketForm'
import { defaultTicket } from '../../../models/enums/defaultValues'
import { Divider, Modal } from 'antd'
import { AuthContext } from '../../../contexts/AuthContext'
import { formatDeadline, TicketForm } from './TicketForm'
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

export const AddTicket = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const { isWorker } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const [formStatus, setFormStatus] = useState('')
    const { printConfirm } = usePrintConfirm()

    if (!isWorker()) return <></>

    const form = useForm<CreateTicket>({ defaultValues: defaultTicket, resolver: yupResolver(TicketSchema) })
    const formRef = useRef<HTMLFormElement>(null)

    const onCancel = () => {
        form.reset(defaultTicket)
        formRef.current?.reset();
        closeModal()
    }

    const onFormSubmit = (data: CreateTicket) => {
        data.deadline = formatDeadline(data);
        setFormStatus('loading')
        createNewTicket(data)
            .then((ticket) => {
                printConfirm({
                    title: 'Print ticket labels',
                    content: <TicketPrintConfirmContent ticket={ticket} />,
                    onOk: () => putPrintTicketLabels(ticket.id),
                })
            })
            .then(() => {
                queryClient.invalidateQueries(['tickets'])
            })
            .then(() => onCancel())
            .catch((error: AppError) => {
                form.setError('root', { message: error?.detail })
            })
            .finally(() => setFormStatus(''))
    }
    const createNewTicket = (formValue: CreateTicket) => {
        return toast.promise(createTicket({ ticket: formValue }), toastCreatePromiseTemplate('ticket'), toastProps)
    }

    return (
        <Modal
            title='Create Ticket'
            open={isModalOpen}
            centered
            closable
            className='ticketModal'
            width={'clamp(400px,80%,900px)'}
            onCancel={closeModal}
            onOk={form.handleSubmit(onFormSubmit)}
            okText='Create ticket'
            
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

const TicketPrintConfirmContent = ({ ticket }: { ticket: Ticket }) => {
    return (
        <p className='viewModal'>
            - Label for the client
            <br />
            - Ticket label for the device
            <br />
            {ticket.accessories.toLowerCase().includes('charger') && (
                <>
                    - Ticket label for the device
                    <br />
                </>
            )}
            <Divider>Ticket #{ticket.id}</Divider>
            Created at: {dateFormat(ticket.timestamp)}
            <br />
            Brand & Model: {ticket.deviceBrand} {ticket.deviceModel} <br />
            Condition: {ticket.deviceCondition} <br />
            Price: {ticket.totalPrice}
            Deadline: {dateFormat(ticket.deadline)}
        </p>
    )
}
