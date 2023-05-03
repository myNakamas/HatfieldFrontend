import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from './ToastProps'
import { CreateTicketInvoice } from '../../models/interfaces/invoice'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../form/TextField'
import { AppModal } from './AppModal'
import { fetchTicketById, putCollectTicket } from '../../axios/http/ticketRequests'
import { Button } from 'antd'
import { getAllClients } from '../../axios/http/userRequests'
import { FormField } from '../form/Field'
import Select from 'react-select'
import { User } from '../../models/interfaces/user'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { PaymentMethod, PaymentMethodList, WarrantyPeriod, WarrantyPeriodList } from '../../models/enums/invoiceEnums'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AddClient } from './users/AddClient'
import { TicketInvoiceSchema } from '../../models/validators/FormValidators'
import { yupResolver } from '@hookform/resolvers/yup'

export const AddTicketInvoice = ({
    ticketId,
    isModalOpen,
    closeModal,
}: {
    ticketId: number
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const formRef = useRef<HTMLFormElement>(null)
    const queryClient = useQueryClient()
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}))
    const { data: ticket } = useQuery(['ticket', ticketId], () => fetchTicketById(ticketId), { enabled: !!ticketId })
    const [showCreateModal, setShowCreateModal] = useState(false)
    const defaultValue = {
        paymentMethod: 'CARD' as PaymentMethod,
        ticketId: ticket?.id,
        totalPrice: ticket?.totalPrice && ticket.deposit ? ticket?.totalPrice - ticket?.deposit : ticket?.totalPrice,
        clientId: ticket?.client?.userId,
        warrantyPeriod: 'ONE_MONTH' as WarrantyPeriod,
    }
    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
        setError,
        reset,
        setValue,
    } = useForm<CreateTicketInvoice>({
        defaultValues: ticket ? defaultValue : {},
        resolver: yupResolver(TicketInvoiceSchema),
    })
    useEffect(() => {
        formRef.current?.reset()
        reset(defaultValue)
    }, [isModalOpen])

    const saveInvoice = (data: CreateTicketInvoice) => {
        toast
            .promise(
                putCollectTicket({ id: data.ticketId, invoice: data }),
                toastCreatePromiseTemplate('invoice'),
                toastProps
            )
            .then(() => {
                closeModal()
                queryClient.invalidateQueries(['tickets']).then()
            })
            .catch((message: string) => {
                setError('root', { message })
            })
    }
    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title={'Create invoice'}>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit(saveInvoice)}>
                <AddClient
                    isModalOpen={showCreateModal}
                    closeModal={() => setShowCreateModal(false)}
                    onSuccess={(user) => setValue('clientId', user.userId)}
                />

                <FormField label={'Ticket Id'} error={errors.ticketId}>
                    <input readOnly className='input' disabled defaultValue={ticketId} />
                </FormField>
                <Controller
                    control={control}
                    name={'clientId'}
                    render={({ field, fieldState }) => (
                        <FormField label='Client' error={fieldState.error}>
                            <Select<User, false>
                                isClearable
                                theme={SelectTheme}
                                styles={SelectStyles<User>()}
                                options={clients}
                                placeholder='Client'
                                value={clients?.find(({ userId }) => field.value === userId) ?? null}
                                onChange={(newValue) => field.onChange(newValue?.userId)}
                                getOptionLabel={(item) => [item.fullName, item.email].join(' ')}
                                getOptionValue={(item) => item.userId}
                            />
                        </FormField>
                    )}
                />
                <Button icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => setShowCreateModal(true)}>
                    Create client
                </Button>
                <Controller
                    control={control}
                    name={'paymentMethod'}
                    render={({ field, fieldState }) => (
                        <FormField label='Payment method' error={fieldState.error}>
                            <Select<ItemPropertyView, false>
                                isClearable
                                theme={SelectTheme}
                                styles={SelectStyles<ItemPropertyView>()}
                                options={PaymentMethodList}
                                placeholder='Select a payment method'
                                value={PaymentMethodList?.find(({ value }) => value === field.value) ?? null}
                                onChange={(newValue) => field.onChange(newValue?.value)}
                                getOptionLabel={(item) => item.value}
                                getOptionValue={(item) => String(item.id)}
                            />
                        </FormField>
                    )}
                />
                <Controller
                    control={control}
                    name={'warrantyPeriod'}
                    render={({ field, fieldState }) => (
                        <FormField label='Warranty period' error={fieldState.error}>
                            <Select<ItemPropertyView, false>
                                isClearable
                                theme={SelectTheme}
                                styles={SelectStyles<ItemPropertyView>()}
                                options={WarrantyPeriodList}
                                placeholder='Warranty period'
                                value={WarrantyPeriodList?.find(({ value }) => value === field.value) ?? null}
                                onChange={(newValue) => field.onChange(newValue?.value)}
                                getOptionLabel={(item) => item.value}
                                getOptionValue={(item) => String(item.id)}
                            />
                        </FormField>
                    )}
                />
                <TextField label={'Notes'} register={register('notes')} error={errors.notes} />
                <TextField label={'Invoice price'} register={register('totalPrice')} error={errors.totalPrice} />
                <FormField label={'Deposit'} error={errors.ticketId}>
                    <input readOnly className='input' disabled defaultValue={ticket?.deposit} />
                </FormField>
                <FormField label={'Total Price'} error={errors.ticketId}>
                    <input readOnly className='input' disabled defaultValue={ticket?.totalPrice} />
                </FormField>
                <div className='flex-100 justify-end'>
                    <Button type='primary' htmlType='submit'>
                        Save and show
                    </Button>
                    <Button htmlType='button' onClick={closeModal}>
                        Close
                    </Button>
                </div>
            </form>
        </AppModal>
    )
}
