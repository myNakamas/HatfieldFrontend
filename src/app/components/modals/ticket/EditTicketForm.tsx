import React, { useContext, useState } from 'react'
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
import { useQuery, useQueryClient } from 'react-query'
import { getAllBrands, getAllDeviceLocations } from '../../../axios/http/shopRequests'
import { User } from '../../../models/interfaces/user'
import { getAllClients } from '../../../axios/http/userRequests'
import moment from 'moment/moment'
import { Button, Card, Checkbox, Collapse, Divider, Space } from 'antd'
import { AddClient } from '../users/AddClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { getUserString } from '../../../utils/helperFunctions'
import { AuthContext } from '../../../contexts/AuthContext'
import CollapsePanel from 'antd/es/collapse/CollapsePanel'
import { createTicket, updateTicket } from '../../../axios/http/ticketRequests'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'

export const EditTicketForm = ({
    ticket,
    closeModal,
    isEdit,
}: {
    ticket: CreateTicket
    closeModal: () => void
    isEdit?: boolean
}) => {
    const { isWorker } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
        setValue,
        getValues,
        watch,
    } = useForm<CreateTicket>({ defaultValues: ticket })
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const models = brands?.find((b) => b.value === watch('deviceBrand'))?.models ?? []
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [tempText, setTempText] = useState('')

    const onFormSubmit = (data: CreateTicket) => {
        const onComplete = isEdit ? editTicket : createNewTicket
        onComplete(data)
            .then(() => {
                queryClient.invalidateQueries(['tickets']).then(() => closeModal())
            })
            .catch((error: AppError) => {
                setError('root', { message: error?.detail })
            })
    }
    const editTicket = (formValue: CreateTicket) => {
        return updateTicket({ id: ticket?.id, ticket: formValue })
    }
    const createNewTicket = (formValue: CreateTicket) => {
        return toast.promise(createTicket({ ticket: formValue }), toastCreatePromiseTemplate('ticket'), toastProps)
    }

    return (
        <>
            <AddClient
                isModalOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
                onSuccess={(user) => setValue('clientId', user.userId)}
            />
            <form className='modalForm' onSubmit={handleSubmit(onFormSubmit)}>
                <div className='modalContainer'>
                    <div className='card'>
                        <Space wrap className='w-100 justify-between'>
                            <Controller
                                control={control}
                                name={'clientId'}
                                render={({ field, fieldState }) => (
                                    <FormField label='Client' error={fieldState.error}>
                                        <Space className={'align-center'}>
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
                                            <Button
                                                icon={<FontAwesomeIcon icon={faPlus} />}
                                                onClick={() => setShowCreateModal(true)}
                                            />
                                        </Space>
                                    </FormField>
                                )}
                            />
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
                                                onChange={(newValue) => {
                                                    if (field.value !== newValue?.value) setValue('deviceModel', '')
                                                    field.onChange(newValue?.value)
                                                }}
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
                        </Space>
                        <Controller
                            name={'problemExplanation'}
                            control={control}
                            render={({ field, fieldState }) => (
                                <FormField label='Problem explanation' error={fieldState.error}>
                                    <div className={'flex-100'}>
                                        <textarea
                                            className='textAreaTicketProblem'
                                            onChange={field.onChange}
                                            value={'' + field.value + tempText}
                                        />
                                        <Dictaphone
                                            setText={(text) => field.onChange(field.value + ' ' + text)}
                                            setTempText={setTempText}
                                        />
                                    </div>
                                </FormField>
                            )}
                        />
                        <TextField
                            register={register('customerRequest')}
                            error={errors.customerRequest}
                            label={'Additional request from customer'}
                        />
                        <Divider />
                        <Space className={'justify-between align-start w-100'} wrap>
                            <div className={'col-wrap'}>
                                <TextField
                                    register={register('devicePassword')}
                                    error={errors.devicePassword}
                                    label={'Device password'}
                                />
                                <Divider>Payment</Divider>
                                <Space>
                                    <TextField
                                        register={register('deposit')}
                                        error={errors.deposit}
                                        inputMode={'numeric'}
                                        label={'Deposit'}
                                        type='currency'
                                    />
                                    <TextField
                                        register={register('totalPrice')}
                                        error={errors.totalPrice}
                                        inputMode={'numeric'}
                                        label={'Total price'}
                                        type='currency'
                                    />
                                </Space>
                            </div>
                            <Card style={{ margin: 'auto' }}>
                                <Space className={'col-wrap'} direction={'vertical'}>
                                    <label htmlFor='withCharger'>
                                        <Checkbox
                                            id={'withCharger'}
                                            defaultChecked={false}
                                            onChange={(e) => {
                                                e.target.checked
                                                    ? setValue(
                                                          'accessories',
                                                          getValues('accessories').concat('With Charger, ')
                                                      )
                                                    : setValue(
                                                          'accessories',
                                                          getValues('accessories').replace('With Charger, ', '')
                                                      )
                                            }}
                                        />{' '}
                                        With Charger
                                    </label>
                                    <label htmlFor='withBag'>
                                        <Checkbox
                                            id={'withBag'}
                                            defaultChecked={false}
                                            onChange={(e) => {
                                                e.target.checked
                                                    ? setValue(
                                                          'accessories',
                                                          getValues('accessories').concat('With Bag, ')
                                                      )
                                                    : setValue(
                                                          'accessories',
                                                          getValues('accessories').replace('With Bag, ', '')
                                                      )
                                            }}
                                        />{' '}
                                        With Bag
                                    </label>
                                    <label htmlFor='withCase'>
                                        <Checkbox
                                            id={'withCase'}
                                            defaultChecked={false}
                                            onChange={(e) => {
                                                e.target.checked
                                                    ? setValue(
                                                          'accessories',
                                                          getValues('accessories').concat('With Case, ')
                                                      )
                                                    : setValue(
                                                          'accessories',
                                                          getValues('accessories').replace('With Case, ', '')
                                                      )
                                            }}
                                        />{' '}
                                        With Case
                                    </label>
                                    <label htmlFor='deadDevice'>
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
                                        />{' '}
                                        Dead device
                                    </label>
                                    <label htmlFor='cracked'>
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
                                                          getValues('deviceCondition').replace(
                                                              'Cracked Screen/Back, ',
                                                              ''
                                                          )
                                                      )
                                            }}
                                        />{' '}
                                        Cracked Screen/Back
                                    </label>
                                </Space>
                            </Card>
                        </Space>
                        <Space wrap className={'w-100 justify-around align-center'}>
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
                                                            moment()
                                                                .add(1, 'days')
                                                                .hours(10)
                                                                .minutes(0)
                                                                .seconds(0)
                                                                .toDate()
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
                            <Collapse accordion destroyInactivePanel={false}>
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
                                            <textarea className='textAreaTicketProblem' {...register('notes')} />
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
                                                                formatCreateLabel={(value) =>
                                                                    'Add a new location: ' + value
                                                                }
                                                                placeholder='Where is the location of the device?'
                                                                value={
                                                                    locations?.find(
                                                                        ({ value }) => field.value === value
                                                                    ) ?? {
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
                        </Space>
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
                            closeModal()
                        }}
                    >
                        Cancel
                    </Button>
                </Space>
            </form>
        </>
    )
}
