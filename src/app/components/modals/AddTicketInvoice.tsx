import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from './ToastProps'
import { CreateTicketInvoice } from '../../models/interfaces/invoice'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../form/TextField'
import { AppModal } from './AppModal'
import { putCollectTicket } from '../../axios/http/ticketRequests'
import { Button, Typography } from 'antd'
import { getAllClients } from '../../axios/http/userRequests'
import { FormField } from '../form/Field'
import Select from 'react-select'
import { User } from '../../models/interfaces/user'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { PaymentMethod, PaymentMethodList, WarrantyPeriod, WarrantyPeriodList } from '../../models/enums/invoiceEnums'
import { AppError, ItemPropertyView } from '../../models/interfaces/generalModels'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AddClient } from './users/AddClient'
import { TicketInvoiceSchema } from '../../models/validators/FormValidators'
import { yupResolver } from '@hookform/resolvers/yup'
import { getUserString } from '../../utils/helperFunctions'
import { AuthContext } from '../../contexts/AuthContext'
import { getAllBrands } from '../../axios/http/shopRequests'
import { Ticket } from '../../models/interfaces/ticket'

export const AddTicketInvoice = ({
    ticket,
    isModalOpen,
    closeModal,
}: {
    ticket?: Ticket
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const { isWorker } = useContext(AuthContext)
    const formRef = useRef<HTMLFormElement>(null)
    const queryClient = useQueryClient()
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const [showCreateModal, setShowCreateModal] = useState(false)
    const defaultValue = {
        paymentMethod: 'CARD' as PaymentMethod,
        ticketId: ticket?.id,
        deviceBrand: ticket?.deviceBrand,
        deviceModel: ticket?.deviceModel,
        totalPrice: ticket?.totalPrice && ticket.deposit ? ticket?.totalPrice - ticket?.deposit : ticket?.totalPrice,
        clientId: ticket?.client?.userId,
        serialNumber: ticket?.serialNumberOrImei,
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
        watch,
    } = useForm<CreateTicketInvoice>({
        defaultValues: ticket ? defaultValue : {},
        resolver: yupResolver(TicketInvoiceSchema),
    })
    const { data: brands } = useQuery('brands', getAllBrands)
    const models = brands?.find((b) => b.value === watch('deviceBrand'))?.models ?? []

    useEffect(() => {
        formRef.current?.reset()
        reset(defaultValue)
    }, [isModalOpen])

    const saveInvoice = (data: CreateTicketInvoice) => {
        const invoice: CreateTicketInvoice = { ...data, deviceName: data.deviceBrand + ' ' + data.deviceModel }
        toast
            .promise(
                putCollectTicket({ id: data.ticketId, invoice }),
                toastCreatePromiseTemplate('invoice'),
                toastProps
            )
            .then(() => {
                closeModal()
                queryClient.invalidateQueries(['tickets']).then()
            })
            .catch(({ detail }: AppError) => {
                setError('root', { message: detail })
            })
    }
    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title={'Create invoice'} isForbidden={!isWorker()}>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit(saveInvoice)}>
                <AddClient
                    isModalOpen={showCreateModal}
                    closeModal={() => setShowCreateModal(false)}
                    onSuccess={(user) => setValue('clientId', user.userId)}
                />
                <Typography>
                    <FormField label={'Ticket Id'} error={errors.ticketId}>
                        <input readOnly className='input' disabled defaultValue={ticket?.id} />
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
                                    getOptionLabel={getUserString}
                                    getOptionValue={(item) => item.userId}
                                />
                            </FormField>
                        )}
                    />
                    <Button icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => setShowCreateModal(true)}>
                        Create client
                    </Button>

                    <div className='flex-100 flex-wrap justify-around'>
                        <Controller
                            control={control}
                            name={'deviceBrand'}
                            render={({ field, fieldState }) => (
                                <FormField label='Brand' error={fieldState.error}>
                                    <Select<ItemPropertyView, false>
                                        isClearable
                                        theme={SelectTheme}
                                        styles={SelectStyles<ItemPropertyView>()}
                                        options={brands}
                                        placeholder='Select or add a new brand'
                                        value={
                                            brands?.find(({ value }) => field.value === value) ?? {
                                                value: field.value,
                                                id: -1,
                                            }
                                        }
                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => item.id + item.value}
                                    />
                                </FormField>
                            )}
                        />
                        <Controller
                            control={control}
                            name={'deviceModel'}
                            render={({ field, fieldState }) => (
                                <FormField label='Model' error={fieldState.error}>
                                    <Select<ItemPropertyView, false>
                                        isClearable
                                        theme={SelectTheme}
                                        styles={SelectStyles<ItemPropertyView>()}
                                        options={models}
                                        placeholder='Select or add a new brand'
                                        value={
                                            models?.find(({ value }) => field.value === value) ?? {
                                                value: field.value,
                                                id: -1,
                                            }
                                        }
                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => item.id + item.value}
                                    />
                                </FormField>
                            )}
                        />
                        <TextField
                            label={'Serial number'}
                            register={register('serialNumber')}
                            error={errors.serialNumber}
                        />
                    </div>
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
                </Typography>
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
