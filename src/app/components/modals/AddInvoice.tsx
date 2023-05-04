import { CreateInvoice } from '../../models/interfaces/invoice'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import { TextField } from '../form/TextField'
import { AppModal } from './AppModal'
import { Button } from 'antd'
import { getAllClients } from '../../axios/http/userRequests'
import { FormField } from '../form/Field'
import Select from 'react-select'
import { User } from '../../models/interfaces/user'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { InvoiceType, PaymentMethodList, WarrantyPeriod, WarrantyPeriodList } from '../../models/enums/invoiceEnums'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AddClient } from './users/AddClient'
import { NewInvoiceSchema } from '../../models/validators/FormValidators'
import { yupResolver } from '@hookform/resolvers/yup'
import { InventoryItem } from '../../models/interfaces/shop'

export const AddInvoice = ({
    item,
    isModalOpen,
    closeModal,
}: {
    item: InventoryItem
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const formRef = useRef<HTMLFormElement>(null)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}))
    const [showCreateModal, setShowCreateModal] = useState(false)
    const defaultItemValue = {
        type: 'SELL' as InvoiceType,
        warrantyPeriod: 'ONE_MONTH' as WarrantyPeriod,
    }
    const newInvoice = {
        warrantyPeriod: 'ONE_MONTH' as WarrantyPeriod,
    }
    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm<CreateInvoice>({
        defaultValues: item ? defaultItemValue : newInvoice,
        resolver: yupResolver(NewInvoiceSchema),
    })
    useEffect(() => {
        formRef.current?.reset()
        reset(defaultItemValue)
    }, [isModalOpen])

    // const saveInvoice = (data: CreateInvoice) => {
    // toast
    //     .promise(
    //         putCollectTicket({ id: data.ticketId, invoice: data }),
    //         toastCreatePromiseTemplate('invoice'),
    //         toastProps
    //     )
    //     .then(() => {
    //         closeModal()
    //         queryClient.invalidateQueries(['tickets']).then()
    //     })
    //     .catch((message: string) => {
    //         setError('root', { message })
    //     })
    // }
    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title={'Create invoice'}>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit(saveInvoice, console.log)}>
                <AddClient isModalOpen={showCreateModal} closeModal={() => setShowCreateModal(false)} />
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
                                value={clients?.find(({ userId }) => field.value === userId)}
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
                                value={PaymentMethodList?.find(({ value }) => value === field.value)}
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
                                value={WarrantyPeriodList?.find(({ value }) => value === field.value)}
                                onChange={(newValue) => field.onChange(newValue?.value)}
                                getOptionLabel={(item) => item.value}
                                getOptionValue={(item) => String(item.id)}
                            />
                        </FormField>
                    )}
                />
                <TextField label={'Notes'} register={register('notes')} error={errors.notes} />
                <TextField label={'Invoice price'} register={register('totalPrice')} error={errors.totalPrice} />
                <FormField label={'Total Price'}>
                    <input readOnly className='input' />
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
