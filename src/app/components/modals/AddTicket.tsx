import { AppModal } from './AppModal'
import { Controller, useForm } from 'react-hook-form'
import { TextField } from '../form/TextField'
import { FormError } from '../form/FormError'
import Select from 'react-select'
import { FormField } from '../form/Field'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { useQuery } from 'react-query'
import { getAllBrands, getAllModels } from '../../axios/http/shopRequests'
import { CreateTicket } from '../../models/interfaces/ticket'
import React, { useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { DeviceLocationArray, TicketStatusesArray } from '../../models/enums/ticketEnums'
import { Dictaphone } from '../form/Dictaphone'

export const AddTicket = ({
    isModalOpen,
    closeModal,
    onComplete,
}: {
    isModalOpen: boolean
    closeModal: () => void
    onComplete: (result: CreateTicket) => Promise<void>
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
    } = useForm<CreateTicket>({ defaultValues: { status: 'PENDING' } })
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const [tempText, setTempText] = useState('')

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
            <h3>Create Ticket</h3>
            <form
                className='modalForm'
                onSubmit={handleSubmit((data) =>
                    onComplete(data).catch((message: string) => {
                        setError('root', { message })
                    })
                )}
            >
                <div className='card'>
                    <Controller
                        name={'problemExplanation'}
                        control={control}
                        defaultValue={''}
                        render={({ field, fieldState }) => (
                            <FormField label='Problem explanation' error={fieldState.error}>
                                <textarea
                                    className='textArea'
                                    onChange={field.onChange}
                                    value={'' + field.value + tempText}
                                />
                                <Dictaphone
                                    className='abs-icon'
                                    setText={(text) => field.onChange(field.value + ' ' + text)}
                                    setTempText={setTempText}
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        control={control}
                        name={'status'}
                        render={({ field, fieldState }) => (
                            <FormField label='Ticket status' error={fieldState.error}>
                                <Select<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles<ItemPropertyView>()}
                                    options={TicketStatusesArray}
                                    placeholder='Fill in the ticket status'
                                    value={field.value as unknown as ItemPropertyView}
                                    onChange={(newValue) => field.onChange(newValue?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => item.id + item.value}
                                />
                            </FormField>
                        )}
                    />
                    <Controller
                        control={control}
                        name={'deviceLocation'}
                        render={({ field, fieldState }) => (
                            <FormField label='Device Location' error={fieldState.error}>
                                <CreatableSelect<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles<ItemPropertyView>()}
                                    options={DeviceLocationArray}
                                    formatCreateLabel={(value) => 'Add a new location: ' + value}
                                    placeholder='Where is the location of the device?'
                                    value={field.value as unknown as ItemPropertyView}
                                    onCreateOption={(item) => field.onChange(item)}
                                    onChange={(newValue) => field.onChange(newValue?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => item.id + item.value}
                                />
                            </FormField>
                        )}
                    />
                </div>

                <div className='card'>
                    <h3>Price</h3>
                    <TextField
                        register={register('deposit')}
                        error={errors.deposit}
                        label={'Deposit'}
                        type='currency'
                    />
                    <TextField
                        register={register('totalPrice')}
                        error={errors.totalPrice}
                        label={'Total price'}
                        type='currency'
                    />
                </div>
                <div className='card'>
                    <h3>Device details</h3>
                    <Controller
                        control={control}
                        name={'deviceBrand'}
                        render={({ field, fieldState }) => (
                            <FormField label='Brand' error={fieldState.error}>
                                <CreatableSelect<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles<ItemPropertyView>()}
                                    options={brands}
                                    formatCreateLabel={(value) => 'Create new brand ' + value}
                                    placeholder='Select or add a new brand'
                                    value={field.value as unknown as ItemPropertyView}
                                    onCreateOption={(item) => field.onChange(item)}
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
                                <CreatableSelect<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles<ItemPropertyView>()}
                                    options={models}
                                    placeholder='Select or add a new brand'
                                    formatCreateLabel={(value) => 'Create new model ' + value}
                                    value={field.value as unknown as ItemPropertyView}
                                    onCreateOption={(item) => field.onChange(item)}
                                    onChange={(newValue) => field.onChange(newValue?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => item.id + item.value}
                                />
                            </FormField>
                        )}
                    />
                    <TextField
                        register={register('serialNumberOrImei')}
                        error={errors.serialNumberOrImei}
                        label={'Serial number or Imei'}
                    />
                    <TextField
                        register={register('devicePassword')}
                        error={errors.devicePassword}
                        label={'Device password'}
                    />
                    <TextField
                        register={register('deviceCondition')}
                        error={errors.deviceCondition}
                        label={'Device condition'}
                    />
                </div>
                <div className='card'>
                    <h3>Other information</h3>
                    <TextField
                        register={register('customerRequest')}
                        error={errors.customerRequest}
                        label={'Additional request from customer'}
                    />
                    <TextField register={register('accessories')} error={errors.accessories} label={'Accessories'} />
                    <FormField label='Notes' error={errors.notes}>
                        <textarea className='textArea' {...register('notes')} />
                    </FormField>
                </div>
                <FormError error={errors.root?.message} />

                <div className='buttonFooter'>
                    <button type='submit' className='successButton'>
                        Submit
                    </button>
                    <button className='cancelButton'>Cancel</button>
                </div>
            </form>
        </AppModal>
    )
}
