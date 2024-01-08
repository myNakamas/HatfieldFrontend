import React, { useContext, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FormField } from '../../form/Field'
import { Dictaphone } from '../../form/Dictaphone'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { TicketStatusesArray } from '../../../models/enums/ticketEnums'
import DateTime from 'react-datetime'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { CreateTicket, Ticket } from '../../../models/interfaces/ticket'
import { useQuery, useQueryClient } from 'react-query'
import { getAllBrands, getAllDeviceLocations } from '../../../axios/http/shopRequests'
import { User } from '../../../models/interfaces/user'
import { getAllClients } from '../../../axios/http/userRequests'
import moment from 'moment/moment'
import { Button, Card, Checkbox, Collapse, Divider, Space, Tooltip } from 'antd'
import { AddClient } from '../users/AddClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { getUserString } from '../../../utils/helperFunctions'
import { AuthContext } from '../../../contexts/AuthContext'
import { createTicket, updateTicket } from '../../../axios/http/ticketRequests'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'
import TextArea from 'antd/es/input/TextArea'
import { putPrintTicketLabels } from '../../../axios/http/documentRequests'
import { usePrintConfirm } from '../PrintConfirm'
import dateFormat from 'dateformat'
import { defaultTicket } from '../../../models/enums/defaultValues'

export const EditTicketForm = ({
    ticket,
    closeModal,
    isEdit,
}: {
    ticket: CreateTicket
    closeModal: () => void
    isEdit?: boolean
}) => {
    const formRef = useRef<HTMLFormElement>(null);
    const { isWorker } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const { printConfirm } = usePrintConfirm()
    const [activeDictaphone, setActiveDictaphone] = useState('')
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
        setValue,
        watch,
        reset,
    } = useForm<CreateTicket>({ defaultValues: ticket })
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const models = brands?.find((b) => b.value === watch('deviceBrand'))?.models ?? []
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [tempText, setTempText] = useState('')

    const resetForm = (ticket:CreateTicket) => {
        formRef.current?.reset();
        reset(ticket);
    }

    const onFormSubmit = (data: CreateTicket) => {
        if (isEdit) {
            editTicket(data)
                .then(() => {
                    queryClient.invalidateQueries(['tickets']).then(() => {
                        closeModal()
                        resetForm(defaultTicket)
                    })
                })
                .catch((error: AppError) => {
                    setError('root', { message: error?.detail })
                })
        } else {
            createNewTicket(data)
                .then((ticket) => {
                    !isEdit &&
                        printConfirm({
                            title: 'Print ticket labels',
                            content: <TicketPrintConfirmContent ticket={ticket} />,
                            onOk: () => putPrintTicketLabels(ticket.id),
                        })

                    queryClient.invalidateQueries(['tickets']).then(() => {
                        closeModal()
                        resetForm(defaultTicket)
                    })
                })
                .catch((error: AppError) => {
                    setError('root', { message: error?.detail })
                })
        }
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
            <form className='modalForm' ref={formRef} onSubmit={handleSubmit(onFormSubmit)}>
                <div className='modalContainer'>
                    <div className='card'>
                        <Space wrap className='w-100 justify-between'>
                            <Controller
                                control={control}
                                name={'clientId'}
                                render={({ field, fieldState }) => (
                                    <FormField label='Client' error={fieldState.error}>
                                        <Space.Compact className={'align-center'}>
                                            <AppSelect<string, User>
                                                options={clients}
                                                placeholder='Select or add a new user'
                                                value={field.value}
                                                onChange={(newValue) => field.onChange(newValue)}
                                                getOptionLabel={getUserString}
                                                getOptionValue={(user) => user.userId}
                                            />
                                            <Button
                                                icon={<FontAwesomeIcon icon={faPlus} />}
                                                onClick={() => setShowCreateModal(true)}
                                            />
                                        </Space.Compact>
                                    </FormField>
                                )}
                            />
                            <div>
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
                            </div>
                            <div>
                                <Controller
                                    control={control}
                                    name={'deviceModel'}
                                    render={({ field, fieldState }) => (
                                        <FormField label='Model' error={fieldState.error}>
                                            <AppCreatableSelect<ItemPropertyView>
                                                options={models}
                                                placeholder='Select or add a new model'
                                                value={field.value}
                                                onCreateOption={(item) => field.onChange(item)}
                                                onChange={(newValue) => field.onChange(newValue)}
                                                optionLabelProp={'value'}
                                                optionFilterProp={'value'}
                                            />
                                        </FormField>
                                    )}
                                />
                            </div>
                        </Space>
                        <Controller
                            name={'problemExplanation'}
                            control={control}
                            render={({ field, fieldState }) => {
                                const key = 'problem'
                                return (
                                    <FormField label='Problem explanation' error={fieldState.error}>
                                        <div className={'flex-100'}>
                                            <TextArea onChange={field.onChange} value={field.value ?? ''} />
                                            <Tooltip title={tempText} open={!!tempText}>
                                                <Dictaphone
                                                    isActive={activeDictaphone === key}
                                                    setText={(text) => field.onChange(field.value + ' ' + text)}
                                                    setTempText={setTempText}
                                                    dictaphoneKey={key}
                                                    setActiveDictaphone={setActiveDictaphone}
                                                />
                                            </Tooltip>
                                        </div>
                                    </FormField>
                                )
                            }}
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
                                    <TicketQuickCheckBox
                                        fieldToCheck={watch('accessories')}
                                        name={'With bag'}
                                        value={'With Bag, '}
                                        onChange={(string) => {
                                            setValue('accessories', string)
                                        }}
                                    />
                                    <TicketQuickCheckBox
                                        fieldToCheck={watch('accessories')}
                                        name={'With charger'}
                                        value={'With Charger, '}
                                        onChange={(string) => {
                                            setValue('accessories', string)
                                        }}
                                    />
                                    <TicketQuickCheckBox
                                        fieldToCheck={watch('accessories')}
                                        name={'With case'}
                                        value={'With Case, '}
                                        onChange={(string) => {
                                            setValue('accessories', string)
                                        }}
                                    />
                                    <TicketQuickCheckBox
                                        fieldToCheck={watch('deviceCondition')}
                                        name={'Dead device'}
                                        value={'Dead device, '}
                                        onChange={(string) => {
                                            setValue('deviceCondition', string)
                                        }}
                                    />
                                    <TicketQuickCheckBox
                                        fieldToCheck={watch('deviceCondition')}
                                        name={'Cracked Screen/ Cracked Back'}
                                        value={'Cracked Screen/ Cracked Back, '}
                                        onChange={(string) => {
                                            setValue('deviceCondition', string)
                                        }}
                                    />
                                </Space>
                            </Card>
                        </Space>
                        <Space wrap className={'w-100 justify-between'} align={'start'}>
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
                            <Collapse
                                accordion
                                defaultActiveKey={'1'}
                                destroyInactivePanel={false}
                                items={[
                                    {
                                        key: '1',
                                        label: 'More details',
                                        children: (
                                            <Space.Compact direction={'vertical'}>
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
                                                    <Controller
                                                        render={({ field: { onChange, value } }) => {
                                                            return (
                                                                <NotesTextArea
                                                                    {...{ onChange, value }}
                                                                    activeDictaphone={activeDictaphone}
                                                                    setActiveDictaphone={setActiveDictaphone}
                                                                />
                                                            )
                                                        }}
                                                        name={'notes'}
                                                        control={control}
                                                    />
                                                </FormField>
                                                <div className='flex-100 justify-between flex-wrap'>
                                                    <div>
                                                        <Controller
                                                            control={control}
                                                            name={'status'}
                                                            render={({ field, fieldState }) => (
                                                                <FormField
                                                                    label='Ticket status'
                                                                    error={fieldState.error}
                                                                >
                                                                    <AppSelect<string, ItemPropertyView>
                                                                        options={TicketStatusesArray}
                                                                        placeholder='Select or add a new user'
                                                                        value={field.value}
                                                                        onChange={(newValue) =>
                                                                            field.onChange(newValue)
                                                                        }
                                                                        getOptionLabel={(item) => item.value}
                                                                        getOptionValue={(item) => item.value}
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
                                                                <FormField
                                                                    label='Device Location'
                                                                    error={fieldState.error}
                                                                >
                                                                    <AppCreatableSelect<ItemPropertyView>
                                                                        options={locations}
                                                                        placeholder='Where is the location of the device?'
                                                                        value={field.value}
                                                                        onCreateOption={(item) => field.onChange(item)}
                                                                        onChange={(newValue) =>
                                                                            field.onChange(newValue)
                                                                        }
                                                                        getOptionLabel={(item) => item.value}
                                                                        getOptionValue={(item) => item.value}
                                                                    />
                                                                </FormField>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </Space.Compact>
                                        ),
                                    },
                                ]}
                            />
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

const TicketQuickCheckBox = ({
    name,
    onChange,
    fieldToCheck,
    value,
}: {
    name: string
    value: string
    fieldToCheck?: string
    onChange: (result: string) => void
}) => {
    const field = fieldToCheck ?? ''
    return (
        <label htmlFor={name}>
            <Checkbox
                id={name}
                defaultChecked={fieldToCheck?.toLowerCase()?.includes(value.toLowerCase())}
                onChange={(e) => {
                    e.target.checked ? onChange(field.concat(value)) : onChange(field.replace(value, ''))
                }}
            />{' '}
            {name}
        </label>
    )
}

const NotesTextArea = ({
    value,
    onChange,
    activeDictaphone,
    setActiveDictaphone,
}: {
    value: string
    activeDictaphone: string
    setActiveDictaphone: (value: string) => void
    onChange: (value: string) => void
}) => {
    const key = 'notes'
    const [tempNotes, setTempNotes] = useState('')
    return (
        <div className={'w-100'}>
            <TextArea onChange={(e) => onChange(e.target.value)} value={value ?? ''} />
            <Tooltip title={tempNotes} open={!!tempNotes}>
                <Dictaphone
                    isActive={activeDictaphone === key}
                    dictaphoneKey={key}
                    setActiveDictaphone={setActiveDictaphone}
                    setText={(text) => onChange((value ?? '') + ' ' + text)}
                    setTempText={setTempNotes}
                />
            </Tooltip>
        </div>
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
