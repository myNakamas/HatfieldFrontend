import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormField } from '../../form/Field'
import { Dictaphone } from '../../form/Dictaphone'
import Select from 'react-select'
import { ItemPropertyView } from '../../../models/interfaces/generalModels'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { DeviceLocationArray, TicketStatusesArray } from '../../../models/enums/ticketEnums'
import CreatableSelect from 'react-select/creatable'
import DateTime from 'react-datetime'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { CreateTicket } from '../../../models/interfaces/ticket'
import { useQuery } from 'react-query'
import { getAllBrands, getAllModels } from '../../../axios/http/shopRequests'
import { User } from '../../../models/interfaces/user'
import { getAllClients } from '../../../axios/http/userRequests'
import moment from 'moment/moment'
import { Button, Space } from 'antd'
import { AddClient } from '../users/AddClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

export const EditTicketForm = ({
    ticket,
    onComplete,
    onCancel,
}: {
    ticket: CreateTicket
    onComplete: (ticket: CreateTicket) => Promise<void>
    onCancel: () => void
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
        reset,
    } = useForm<CreateTicket>({ defaultValues: ticket })
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}))
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [tempText, setTempText] = useState('')
    return (
        <form
            className='modalForm'
            onSubmit={handleSubmit((data) =>
                onComplete(data).catch((message: string) => {
                    setError('root', { message })
                })
            )}
        >
            <div className='modalContainer'>
                <div className='card'>
                    <AddClient isModalOpen={showCreateModal} closeModal={() => setShowCreateModal(false)} />
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
                                    setText={(text) => field.onChange(field.value + ' ' + text)}
                                    setTempText={setTempText}
                                />
                            </FormField>
                        )}
                    />
                    <TextField
                        register={register('customerRequest')}
                        error={errors.customerRequest}
                        label={'Additional request from customer'}
                    />
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
                        name={'status'}
                        render={({ field, fieldState }) => (
                            <FormField label='Ticket status' error={fieldState.error}>
                                <Select<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles<ItemPropertyView>()}
                                    options={TicketStatusesArray}
                                    placeholder='Fill in the ticket status'
                                    value={TicketStatusesArray.find(({ value }) => field.value === value)}
                                    onChange={(newValue) => field.onChange(newValue?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => item.id + item.value}
                                />
                            </FormField>
                        )}
                    />
                    <div className='flex-100 justify-between flex-wrap'>
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
                                            locale={'uk'}
                                            value={field.value}
                                            onChange={(value) => {
                                                if (moment.isMoment(value)) field.onChange(value.toDate())
                                            }}
                                            dateFormat={'DD/MM/yyyy'}
                                            timeFormat={'HH:mm:s'}
                                            isValidDate={(currentDate) =>
                                                currentDate >= moment().subtract(1, 'day').toDate()
                                            }
                                        />
                                        <div className='flex-100 justify-between'>
                                            <Button
                                                htmlType='button'
                                                onClick={() => field.onChange(moment().add(30, 'minutes').toDate())}
                                            >
                                                30 minutes
                                            </Button>
                                            <Button
                                                htmlType='button'
                                                onClick={() => field.onChange(moment().add(1, 'hour').toDate())}
                                            >
                                                1 hour
                                            </Button>
                                            <Button
                                                htmlType='button'
                                                onClick={() => field.onChange(moment().add(2, 'hours').toDate())}
                                            >
                                                2 hours
                                            </Button>
                                        </div>
                                    </FormField>
                                )}
                            />
                        </div>
                    </div>
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
                    <div className='flex-100 justify-between flex-wrap'>
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

                    <TextField register={register('accessories')} error={errors.accessories} label={'Accessories'} />
                    <FormField label='Notes' error={errors.notes}>
                        <textarea className='textArea' {...register('notes')} />
                    </FormField>
                </div>
                <FormError error={errors.root?.message} />
            </div>
            <Space className='buttonFooter'>
                <Button htmlType='submit' type='primary'>
                    Submit
                </Button>
                <Button
                    type='text'
                    htmlType='button'
                    onClick={() => {
                        reset()
                        onCancel()
                    }}
                >
                    Cancel
                </Button>
            </Space>
        </form>
    )
}
