import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormField } from '../../form/Field'
import { Dictaphone } from '../../form/Dictaphone'
import Select from 'react-select'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { DeviceLocationArray, TicketStatusesArray } from '../../../models/enums/ticketEnums'
import CreatableSelect from 'react-select/creatable'
import DateTime from 'react-datetime'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { CreateTicket, Ticket } from '../../../models/interfaces/ticket'
import { useQuery } from 'react-query'
import { getAllBrands } from '../../../axios/http/shopRequests'

export const CollectTicketForm = ({
    ticket,
    onComplete,
    onCancel,
}: {
    ticket: Ticket
    onComplete: (createInvoice: {}, ticketId: number) => Promise<void>
    onCancel: () => void
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
        reset,
        watch,
    } = useForm<CreateTicket>({ defaultValues: ticket })
    const { data: brands } = useQuery('brands', getAllBrands)
    const models = brands?.find((b) => b.value === watch('deviceBrand'))?.models ?? []

    const [tempText, setTempText] = useState('')
    return (
        <form
            className='modalForm'
            onSubmit={handleSubmit((data) =>
                onComplete(data, ticket.id)
                    .then(() => reset())
                    .catch((error: AppError) => {
                        setError('root', { message: error.detail })
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
                                value={TicketStatusesArray.find(({ value }) => field.value === value) ?? null}
                                onChange={(newValue) => field.onChange(newValue?.value)}
                                getOptionLabel={(item) => item.value}
                                getOptionValue={(item) => item.id + item.value}
                            />
                        </FormField>
                    )}
                />
                <div className='flex-100 justify-between'>
                    <div>
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
                                        value={
                                            DeviceLocationArray.find(({ value }) => field.value === value) ?? {
                                                value: field.value,
                                                id: -1,
                                            }
                                        }
                                        onCreateOption={(item) => field.onChange(item)}
                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => item.id + item.value}
                                    />
                                </FormField>
                            )}
                        />
                    </div>

                    <div>
                        <Controller
                            control={control}
                            name={'deadline'}
                            render={({ field, fieldState }) => (
                                <FormField label='Deadline' error={fieldState.error}>
                                    <DateTime
                                        value={field.value}
                                        onChange={(value) => {
                                            field.onChange(String(value))
                                        }}
                                        isValidDate={(currentDate) => currentDate > new Date()}
                                    />
                                </FormField>
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className='card'>
                <h3>Price</h3>
                <TextField register={register('deposit')} error={errors.deposit} label={'Deposit'} type='currency' />
                <TextField
                    register={register('totalPrice')}
                    error={errors.totalPrice}
                    label={'Total price'}
                    type='currency'
                />
            </div>
            <div className='card'>
                <h3>Device details</h3>
                <div className='flex-100 justify-between'>
                    <div>
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
                                        value={
                                            brands?.find(({ value }) => field.value === value) ?? {
                                                value: field.value,
                                                id: -1,
                                            }
                                        }
                                        onCreateOption={(item) => field.onChange(item)}
                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => item.id + item.value}
                                    />
                                </FormField>
                            )}
                        />
                    </div>
                    <div>
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
                                        value={
                                            models?.find(({ value }) => field.value === value) ?? {
                                                value: field.value,
                                                id: -1,
                                            }
                                        }
                                        onCreateOption={(item) => field.onChange(item)}
                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => item.id + item.value}
                                    />
                                </FormField>
                            )}
                        />
                    </div>
                </div>
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
                <button
                    className='cancelButton'
                    type='button'
                    onClick={() => {
                        reset()
                        onCancel()
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
