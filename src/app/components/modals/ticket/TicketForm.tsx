import React, { useContext, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { AntFormField, FormField } from '../../form/Field'
import { Dictaphone } from '../../form/Dictaphone'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { TicketStatusesArray, ticketTasks } from '../../../models/enums/ticketEnums'
import DateTime from 'react-datetime'
import { AntTextField, TaskDeadline, TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { CreateTicket, Ticket } from '../../../models/interfaces/ticket'
import { useQuery, useQueryClient } from 'react-query'
import { getAllBrands, getAllDeviceLocations } from '../../../axios/http/shopRequests'
import { User } from '../../../models/interfaces/user'
import { getAllClients, getAllFilteredClients } from '../../../axios/http/userRequests'
import moment from 'moment/moment'
import {
    AutoComplete,
    Button,
    Card,
    Checkbox,
    Collapse,
    Divider,
    Form,
    FormInstance,
    Input,
    Select,
    SelectProps,
    Space,
    Spin,
    Tag,
    Tooltip,
} from 'antd'
import { AddClient } from '../users/AddClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { getUserString } from '../../../utils/helperFunctions'
import { AuthContext } from '../../../contexts/AuthContext'
import { createTicket, updateTicket } from '../../../axios/http/ticketRequests'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { AppCreatableSelect } from '../../form/AppSelect'
import TextArea from 'antd/es/input/TextArea'
import { putPrintTicketLabels } from '../../../axios/http/documentRequests'
import { usePrintConfirm } from '../PrintConfirm'
import dateFormat from 'dateformat'
import { defaultTicket } from '../../../models/enums/defaultValues'
import { UserFilter } from '../../../models/interfaces/filters'
import { yupResolver } from '@hookform/resolvers/yup'
import { TicketSchema } from '../../../models/validators/FormValidators'
import { BaseOptionType } from 'antd/es/select'

export const TicketForm = ({
    ticket,
    closeModal,
    isEdit,
}: {
    ticket: CreateTicket
    closeModal: () => void
    isEdit?: boolean
}) => {
    const formRef = useRef<HTMLFormElement>(null)
    const { isWorker } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const { printConfirm } = usePrintConfirm()
    const [activeDictaphone, setActiveDictaphone] = useState('')
    const [formStatus, setFormStatus] = useState('')
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setError,
        setValue,
        watch,
        reset,
    } = useForm<CreateTicket>({ defaultValues: ticket, resolver: yupResolver(TicketSchema) })
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const models = brands?.find((b) => b.value === watch('deviceBrand'))?.models ?? []
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [tempText, setTempText] = useState('')

    const resetForm = (ticket: CreateTicket) => {
        formRef.current?.reset()
        reset(ticket)
    }

    const exit = () => {
        resetForm(defaultTicket)
        closeModal()
    }

    const onFormSubmit = (data: CreateTicket) => {
        setFormStatus('loading')
        const promise = isEdit
            ? editTicket(data)
            : createNewTicket(data).then((ticket) => {
                  !isEdit &&
                      printConfirm({
                          title: 'Print ticket labels',
                          content: <TicketPrintConfirmContent ticket={ticket} />,
                          onOk: () => putPrintTicketLabels(ticket.id),
                      })
              })
        promise
            .then(() => {
                return queryClient.invalidateQueries(['tickets'])
            })
            .then(() => {
                exit()
            })
            .catch((error: AppError) => {
                setError('root', { message: error?.detail })
            })
            .finally(() => setFormStatus(''))
    }
    const editTicket = (formValue: CreateTicket) => {
        return updateTicket({ id: ticket?.id, ticket: formValue })
    }
    const createNewTicket = (formValue: CreateTicket) => {
        return toast.promise(createTicket({ ticket: formValue }), toastCreatePromiseTemplate('ticket'), toastProps)
    }

    console.log(watch())

    return (
        <>
            <AddClient
                isModalOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
                onSuccess={(user) => setValue('client', user)}
            />
            <form ref={formRef} onSubmit={handleSubmit(onFormSubmit)} className='modalForm ticketForm'>
                <div className='modalContainer'>
                    <Space wrap className='w-100'>
                        <ClientForm
                            user={watch('client')}
                            onChange={(user) => {
                                setValue('client', user as User)
                            }}
                        />

                        <Space.Compact direction='vertical'>
                            <Controller
                                control={control}
                                name={'deviceBrand'}
                                render={({ field, fieldState }) => (
                                    <AntFormField label='Brand' error={fieldState.error}>
                                        <AppCreatableSelect<ItemPropertyView>
                                            options={brands}
                                            placeholder='Brand of device'
                                            value={field.value}
                                            onChange={(newValue) => {
                                                setValue('deviceModel', '')
                                                field.onChange(newValue)
                                            }}
                                            optionLabelProp={'value'}
                                            optionFilterProp={'value'}
                                        />
                                    </AntFormField>
                                )}
                            />
                            <Controller
                                control={control}
                                name={'deviceModel'}
                                render={({ field, fieldState }) => (
                                    <AntFormField label='Model' error={fieldState.error}>
                                        <AppCreatableSelect<ItemPropertyView>
                                            options={models}
                                            placeholder='Model of device'
                                            value={field.value}
                                            onChange={(newValue) => field.onChange(newValue)}
                                            optionLabelProp={'value'}
                                            optionFilterProp={'value'}
                                        />
                                    </AntFormField>
                                )}
                            />
                            <AntTextField<CreateTicket>
                                control={control}
                                name='devicePassword'
                                label={'Password'}
                                placeholder='The password of the device'
                            />
                        </Space.Compact>
                        <Space.Compact direction='vertical'>
                            <Controller
                                control={control}
                                name={'problemExplanation'}
                                render={({ field:{onChange, value}, fieldState }) => (
                                    <AntFormField label='Task' error={fieldState.error}>
                                        <AutoComplete
                                            status={fieldState?.error ? 'error' : undefined}
                                            placeholder='What needs to be done?'
                                            options={ticketTasks}
                                            onChange={onChange}
                                            value={value}
                                        />
                                    </AntFormField>
                                )}
                            />
                            <TaskDeadline                                 
                                control={control}
                                name='deadline'
                                label={'Deadline:'}/>
                            Task details - Task dropdown - Deadline - Notes
                        </Space.Compact>
                        <Space.Compact direction='vertical'>Payment details - Deposit - Full Price</Space.Compact>
                    </Space>
                </div>
                <FormError error={errors.root?.message} />
                <Space className='buttonFooter'>
                    <Button
                        htmlType='submit'
                        type='primary'
                        loading={formStatus == 'loading'}
                        onClick={() => console.log(watch())}
                    >
                        Submit
                    </Button>
                    <Button type='text' htmlType='reset' onClick={exit}>
                        Cancel
                    </Button>
                </Space>
            </form>
        </>
    )
}

type LabeledUser = User & { label: string; value: string }

const ClientForm = ({ user, onChange }: { user?: User; onChange: (user?: Partial<User>) => void }) => {
    const [filter, setFilter] = useState<UserFilter>({})
    const { data, isFetching } = useQuery(['clients', filter], () => getAllFilteredClients({ filter }), {})

    const props: SelectProps = {
        mode: 'tags',
        className: 'w-100',
        allowClear: true,
        loading: isFetching,
        autoClearSearchValue: true,
        filterOption: false,

        showSearch: true,
        notFoundContent: isFetching ? <Spin size='small' /> : null,
        tagRender: (props) => (
            <div key={`key${props.label}_${props.value}`} className='ps-1'>
                {props.label}
            </div>
        ),
        optionLabelProp: 'label',
        style: { minWidth: 200, maxWidth: 300, textAlign: 'left' },
        dropdownStyle: { textAlign: 'left' },
    }

    const options: LabeledUser[] =
        data?.map((user) => ({ ...user, value: user.userId })).filter((option) => user?.userId !== option.userId) ?? []
    const userExists = user?.userId != undefined

    return (
        <Card
            type='inner'
            size='small'
            title={userExists ? `Selected client` : 'Creating client'}
            extra={
                <Tag
                    closable={userExists}
                    onClose={(e) => {
                        e.preventDefault()
                        onChange(undefined)
                    }}
                    color={userExists ? 'blue' : 'green'}
                >
                    {userExists ? user.fullName ?? user.username : 'New User'}
                </Tag>
            }
        >
            <Space direction='vertical'>
                <Select<Array<string>, LabeledUser>
                    {...props}
                    value={user?.phones ? [user.phones.join(', ')] : []}
                    placeholder='Phone number'
                    options={options.map((user) => ({ ...user, label: user.phones?.join(', ') }))}
                    onSearch={(value) => {
                        setFilter({ phone: value })
                        onChange(userExists ? undefined : { ...user, phones: undefined })
                    }}
                    onSelect={(value: string, option) => {
                        onChange(option.userId ? option : { ...user, phones: [value] })
                    }}
                    onClear={() => onChange(userExists ? undefined : { ...user, phones: undefined })}
                    onDeselect={() => onChange(userExists ? undefined : { ...user, phones: undefined })}
                />

                <Select<Array<string>, LabeledUser>
                    {...props}
                    value={user?.email ? [user.email] : []}
                    placeholder='Email'
                    options={options.map((user) => ({ ...user, label: user.email }))}
                    onSearch={(value) => {
                        setFilter({ email: value })
                        onChange(userExists ? undefined : { ...user, email: undefined })
                    }}
                    onSelect={(value, option) => {
                        onChange(option.userId ? option : { ...user, email: value })
                    }}
                    onClear={() => onChange(userExists ? undefined : { ...user, email: undefined })}
                    onDeselect={() => onChange(userExists ? undefined : { ...user, email: undefined })}
                />
                <Select<Array<string>, LabeledUser>
                    {...props}
                    value={user?.fullName ? [user.fullName] : []}
                    placeholder='Full name'
                    options={options.map((user) => ({ ...user, label: user.fullName }))}
                    onSearch={(value) => {
                        setFilter({ fullName: value })
                        onChange(userExists ? undefined : { ...user, fullName: undefined })
                    }}
                    onSelect={(value, option) => {
                        onChange(option.userId ? option : { ...user, fullName: value })
                    }}
                    onClear={() => onChange(userExists ? undefined : { ...user, fullName: undefined })}
                    onDeselect={() => onChange(userExists ? undefined : { ...user, fullName: undefined })}
                />
            </Space>
        </Card>
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

