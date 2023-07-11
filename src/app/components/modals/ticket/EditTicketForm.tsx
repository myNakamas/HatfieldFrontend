import React, { useContext, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormField } from '../../form/Field'
import { Dictaphone } from '../../form/Dictaphone'
import Select from 'react-select'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { TicketStatusesArray } from '../../../models/enums/ticketEnums'
import CreatableSelect from 'react-select/creatable'
import DateTime from 'react-datetime'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { CreateTicket } from '../../../models/interfaces/ticket'
import { useQuery } from 'react-query'
import { getAllBrands, getAllDeviceLocations } from '../../../axios/http/shopRequests'
import { User } from '../../../models/interfaces/user'
import { getAllClients } from '../../../axios/http/userRequests'
import moment from 'moment/moment'
import { Button, Checkbox, Collapse, Space } from 'antd'
import { AddClient } from '../users/AddClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { EditTicketSchema } from '../../../models/validators/FormValidators'
import { getUserString } from '../../../utils/helperFunctions'
import { AuthContext } from '../../../contexts/AuthContext'
import CollapsePanel from 'antd/es/collapse/CollapsePanel'

export const EditTicketForm = ({
    ticket,
    onComplete,
    onCancel,
}: {
    ticket: CreateTicket
    onComplete: (ticket: CreateTicket) => Promise<void>
    onCancel: () => void
}) => {
    const { isWorker } = useContext(AuthContext)
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
        reset,
        setValue,
        getValues,
        watch,
    } = useForm<CreateTicket>({ defaultValues: ticket, resolver: yupResolver(EditTicketSchema) })
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const models = brands?.find((b) => b.value === watch('deviceBrand'))?.models ?? []
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [tempText, setTempText] = useState('')
    useEffect(() => {
        // formRef.current?.reset()
        reset(ticket)
    }, [ticket])

    return (
        <>
            <AddClient
                isModalOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
                onSuccess={(user) => setValue('clientId', user.userId)}
            />
            <form
                id='editTicketForm'
                className='modalForm'
                onSubmit={handleSubmit((data) => {
                    onComplete(data).catch((error: AppError) => {
                        setError('root', { message: error?.detail })
                    })
                    reset()
                })}
            >
                <div className='modalContainer'>
                    <div className='card'>
                        <Controller
                            name={'problemExplanation'}
                            control={control}
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

                        <div className='flex-100 justify-between flex-wrap'>
                            <div>
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
                                <Button
                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Create client
                                </Button>
                            </div>
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
                                                placeholder='Select or add a new model'
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
                        <div className='flex-100 justify-between flex-wrap'>
                            <Checkbox
                                id={'withCharger'}
                                defaultChecked={false}
                                onChange={(e) => {
                                    e.target.checked
                                        ? setValue('accessories', getValues('accessories').concat('With Charger, '))
                                        : setValue(
                                              'accessories',
                                              getValues('accessories').replace('With Charger, ', '')
                                          )
                                }}
                            />
                            <label htmlFor='withCharger'>With Charger</label>

                            <Checkbox
                                id={'withBag'}
                                defaultChecked={false}
                                onChange={(e) => {
                                    e.target.checked
                                        ? setValue('accessories', getValues('accessories').concat('With Bag, '))
                                        : setValue('accessories', getValues('accessories').replace('With Bag, ', ''))
                                }}
                            />
                            <label htmlFor='withBag'>With Bag</label>

                            <Checkbox
                                id={'withCase'}
                                defaultChecked={false}
                                onChange={(e) => {
                                    e.target.checked
                                        ? setValue('accessories', getValues('accessories').concat('With Case, '))
                                        : setValue('accessories', getValues('accessories').replace('With Case, ', ''))
                                }}
                            />
                            <label htmlFor='withCase'>With Case</label>

                            <Checkbox
                                id={'deadDevice'}
                                defaultChecked={false}
                                onChange={(e) => {
                                    e.target.checked
                                        ? setValue(
                                              'deviceCondition',
                                              getValues('deviceCondition').concat('Dead device, ')
                                          )
                                        : setValue(
                                              'deviceCondition',
                                              getValues('deviceCondition').replace('Dead device, ', '')
                                          )
                                }}
                            />
                            <label htmlFor='deadDevice'>Dead device</label>

                            <Checkbox
                                id={'cracked'}
                                defaultChecked={false}
                                onChange={(e) => {
                                    e.target.checked
                                        ? setValue(
                                              'deviceCondition',
                                              getValues('deviceCondition').concat('Cracked Screen/Back, ')
                                          )
                                        : setValue(
                                              'deviceCondition',
                                              getValues('deviceCondition').replace('Cracked Screen/Back, ', '')
                                          )
                                }}
                            />
                            <label htmlFor='cracked'>Cracked Screen/Back</label>
                        </div>
                        <TextField
                            register={register('devicePassword')}
                            error={errors.devicePassword}
                            label={'Device password'}
                        />
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
                    <Collapse>
                        <CollapsePanel key={'1'} header={'More details'}>
                            <div className='card'>
                                <TextField
                                    register={register('serialNumberOrImei')}
                                    error={errors.serialNumberOrImei}
                                    label={'Serial number or Imei'}
                                />
                                <TextField
                                    register={register('deviceCondition')}
                                    error={errors.deviceCondition}
                                    label={'Device condition'}
                                />
                                <TextField
                                    register={register('accessories')}
                                    error={errors.accessories}
                                    label={'Accessories'}
                                />
                                <FormField label='Notes' error={errors.notes}>
                                    <textarea className='textArea' {...register('notes')} />
                                </FormField>
                                <div className='flex-100 justify-between flex-wrap'>
                                    <div>
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
                                                        value={
                                                            TicketStatusesArray.find(
                                                                ({ value }) => field.value === value
                                                            ) ?? null
                                                        }
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
                                            name={'deviceLocation'}
                                            render={({ field, fieldState }) => (
                                                <FormField label='Device Location' error={fieldState.error}>
                                                    <CreatableSelect<ItemPropertyView, false>
                                                        isClearable
                                                        theme={SelectTheme}
                                                        styles={SelectStyles<ItemPropertyView>()}
                                                        options={locations}
                                                        formatCreateLabel={(value) => 'Add a new location: ' + value}
                                                        placeholder='Where is the location of the device?'
                                                        value={
                                                            locations?.find(({ value }) => field.value === value) ?? {
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
                            </div>
                        </CollapsePanel>
                    </Collapse>
                    <div className='flex-100 justify-between'>
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
                                        timeFormat={'HH:mm:ss'}
                                        isValidDate={(currentDate) =>
                                            currentDate >= moment().subtract(1, 'day').toDate()
                                        }
                                    />
                                    <div className='flex-100 justify-between'>
                                        <Button
                                            htmlType='button'
                                            onClick={() => field.onChange(moment().add(15, 'minutes').toDate())}
                                        >
                                            15 minutes
                                        </Button>
                                        <Button
                                            htmlType='button'
                                            onClick={() => field.onChange(moment().add(20, 'minutes').toDate())}
                                        >
                                            20 minutes
                                        </Button>
                                        <Button
                                            htmlType='button'
                                            onClick={() => field.onChange(moment().add(45, 'minutes').toDate())}
                                        >
                                            45 minutes
                                        </Button>
                                    </div>
                                    <div className='flex-100 justify-between'>
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
                                        <Button
                                            htmlType='button'
                                            onClick={() =>
                                                field.onChange(
                                                    moment().add(1, 'days').hours(10).minutes(0).seconds(0).toDate()
                                                )
                                            }
                                        >
                                            10 AM tomorrow
                                        </Button>
                                    </div>
                                </FormField>
                            )}
                        />
                    </div>
                    <FormError error={errors.root?.message} />
                </div>
                <Space className='buttonFooter'>
                    <Button htmlType='submit' type='primary'>
                        Submit
                    </Button>
                    <Button
                        type='text'
                        htmlType='reset'
                        onClick={() => {
                            onCancel()
                        }}
                    >
                        Cancel
                    </Button>
                </Space>
            </form>
        </>
    )
}
