import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from './ToastProps'
import { CreateTicketInvoice } from '../../models/interfaces/invoice'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../form/TextField'
import { AppModal } from './AppModal'
import { putCollectTicket, putCreateDepositInvoice } from '../../axios/http/ticketRequests'
import { Button, Space, Typography } from 'antd'
import { getAllClients } from '../../axios/http/userRequests'
import { FormField } from '../form/Field'
import { User } from '../../models/interfaces/user'
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
import { AppCreatableSelect, AppSelect } from '../form/AppSelect'

export const AddTicketInvoice = ({
    ticket,
    isModalOpen,
    closeModal,
    isDeposit,
}: {
    ticket?: Ticket
    isModalOpen: boolean
    closeModal: () => void
    isDeposit?: boolean
}) => {
    const { isWorker } = useContext(AuthContext)
    const formRef = useRef<HTMLFormElement>(null)
    const queryClient = useQueryClient()
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const [showCreateModal, setShowCreateModal] = useState(false)
    const defaultValue = !isDeposit
        ? {
              paymentMethod: 'CARD' as PaymentMethod,
              ticketId: ticket?.id,
              deviceBrand: ticket?.deviceBrand,
              deviceModel: ticket?.deviceModel,
              totalPrice:
                  ticket?.totalPrice && ticket.deposit ? ticket?.totalPrice - ticket?.deposit : ticket?.totalPrice,
              clientId: ticket?.client?.userId,
              serialNumber: ticket?.serialNumberOrImei,
              warrantyPeriod: 'ONE_MONTH' as WarrantyPeriod,
          }
        : {
              paymentMethod: 'CASH' as PaymentMethod,
              ticketId: ticket?.id,
              deviceBrand: ticket?.deviceBrand,
              deviceModel: ticket?.deviceModel,
              totalPrice: ticket?.deposit,
              clientId: ticket?.client?.userId,
              serialNumber: ticket?.serialNumberOrImei,
              warrantyPeriod: 'NONE' as WarrantyPeriod,
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
        const promise = !isDeposit ? putCollectTicket : putCreateDepositInvoice
        toast
            .promise(promise({ id: data.ticketId, invoice }), toastCreatePromiseTemplate('invoice'), toastProps)
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
            <AddClient
                isModalOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
                onSuccess={(user) => setValue('clientId', user.userId)}
            />
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit(saveInvoice)}>
                <Typography>
                    <FormField label={'Ticket Id'} error={errors.ticketId}>
                        <input readOnly className='input' disabled defaultValue={ticket?.id} />
                    </FormField>
                    <Controller
                        control={control}
                        name={'clientId'}
                        render={({ field, fieldState }) => (
                            <FormField label='Client' error={fieldState.error}>
                                <Space.Compact>
                                    <AppSelect<string, User>
                                        options={clients}
                                        placeholder='Client'
                                        value={field.value}
                                        onChange={field.onChange}
                                        getOptionLabel={getUserString}
                                        getOptionValue={(item) => item.userId}
                                    />
                                    <Button
                                        icon={<FontAwesomeIcon icon={faPlus} />}
                                        onClick={() => setShowCreateModal(true)}
                                    >
                                        Create client
                                    </Button>
                                </Space.Compact>
                            </FormField>
                        )}
                    />

                    <Space className='flex-100' wrap>
                        <Controller
                            control={control}
                            name={'deviceBrand'}
                            render={({ field, fieldState }) => (
                                <FormField label='Brand' error={fieldState.error}>
                                    <AppCreatableSelect<ItemPropertyView>
                                        options={brands}
                                        placeholder='Select or add a new brand'
                                        value={field.value}
                                        onCreateOption={(item) => {
                                            setValue('deviceModel', '')
                                            field.onChange(item)
                                        }}
                                        onChange={(newValue) => {
                                            setValue('deviceModel', '')
                                            field.onChange(newValue)
                                        }}
                                        optionLabelProp={'value'}
                                        optionFilterProp={'value'}
                                    />
                                </FormField>
                            )}
                        />
                        <Controller
                            control={control}
                            name={'deviceModel'}
                            render={({ field, fieldState }) => (
                                <FormField label='Model' error={fieldState.error}>
                                    <AppCreatableSelect<ItemPropertyView>
                                        options={models}
                                        placeholder='Select or add a new model'
                                        value={field.value}
                                        onCreateOption={(item) => field.onChange({ value: item })}
                                        onChange={(item) => field.onChange(item ? { value: item } : null)}
                                        optionLabelProp={'value'}
                                        optionFilterProp={'value'}
                                    />
                                </FormField>
                            )}
                        />
                        <TextField
                            label={'Serial number'}
                            register={register('serialNumber')}
                            error={errors.serialNumber}
                        />
                    </Space>
                    <Space wrap>
                        <Controller
                            control={control}
                            name={'paymentMethod'}
                            render={({ field, fieldState }) => (
                                <FormField label='Payment method' error={fieldState.error}>
                                    <AppSelect<string, ItemPropertyView>
                                        options={PaymentMethodList}
                                        placeholder='Select a payment method'
                                        value={field.value}
                                        onChange={field.onChange}
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => item.value}
                                    />
                                </FormField>
                            )}
                        />
                        <Controller
                            control={control}
                            name={'warrantyPeriod'}
                            render={({ field, fieldState }) => (
                                <FormField label='Warranty period' error={fieldState.error}>
                                    <AppSelect<string, ItemPropertyView>
                                        options={WarrantyPeriodList}
                                        placeholder='Warranty period'
                                        value={field.value}
                                        onChange={(warranty) =>
                                            warranty
                                                ? field.onChange(warranty)
                                                : field.onChange('NONE' as WarrantyPeriod)
                                        }
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => item.value}
                                    />
                                </FormField>
                            )}
                        />
                    </Space>
                    <TextField label={'Notes'} register={register('notes')} error={errors.notes} />
                    <Space>
                        <TextField
                            label={isDeposit ? 'New Deposit amount' : 'Invoice price'}
                            register={register('totalPrice')}
                            error={errors.totalPrice}
                        />
                        {isDeposit && ticket?.deposit && (
                            <TextField
                                readOnly
                                disabled
                                label={'Accumulated deposit'}
                                value={ticket.deposit + +watch('totalPrice')}
                            />
                        )}
                    </Space>
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
