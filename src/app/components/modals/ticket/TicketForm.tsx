import {
    AutoComplete,
    Card,
    Checkbox,
    Col,
    Collapse,
    Form,
    Row,
    Select,
    SelectProps,
    Skeleton,
    Space,
    Spin,
    Switch,
    Tag,
    Tooltip,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import moment from 'moment'
import { useState } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { useQuery } from 'react-query'
import { getAllBrands, getAllDeviceLocations } from '../../../axios/http/shopRequests'
import { getTicketAutocomplete } from '../../../axios/http/ticketRequests'
import { getAllFilteredClients } from '../../../axios/http/userRequests'
import { defaultTicket } from '../../../models/enums/defaultValues'
import { TicketStatusesArray } from '../../../models/enums/ticketEnums'
import { UserFilter } from '../../../models/interfaces/filters'
import { ItemPropertyView } from '../../../models/interfaces/generalModels'
import { CreateTicket } from '../../../models/interfaces/ticket'
import { User } from '../../../models/interfaces/user'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'
import { Dictaphone } from '../../form/Dictaphone'
import { AntFormField, FormField } from '../../form/Field'
import { FormError } from '../../form/FormError'
import { getPhoneString, parsePhone } from '../../form/PhoneSelect'
import { AntTextField, TaskDeadline } from '../../form/TextField'
import { BarcodeReaderButton } from '../QrReaderModal'
import { AddClient } from '../users/AddClient'

const defaultTaskAutofill = {
    key: 'option_estimate',
    value: 'Estimate price of repair',
    label: 'Estimate price of repair',
}
const getTicketAutofill = (ticketTaskAutocompleteList: string[] | undefined) => {
    const ticketAutofillList =
        ticketTaskAutocompleteList?.map((task) => ({ key: task, value: task, label: task })) ?? []
    if (!ticketAutofillList.find((task) => task.label === defaultTaskAutofill.label))
        ticketAutofillList.push(defaultTaskAutofill)
    return ticketAutofillList
}
export const TicketForm = ({
    form: {
        watch,
        setValue,
        control,
        handleSubmit,
        getValues,
        formState: { errors },
    },
    formRef,
    onSubmit,
    ticket,
}: {
    formRef: React.Ref<HTMLFormElement>
    form: UseFormReturn<CreateTicket>
    ticket: Partial<CreateTicket>
    formStatus: string
    onCancel: () => void
    onSubmit: (ticket: CreateTicket) => void
}) => {
    const [activeDictaphone, setActiveDictaphone] = useState('')
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: locations } = useQuery('deviceLocations', getAllDeviceLocations)
    const { data: ticketTaskAutocompleteList } = useQuery('ticketAutocompletes', getTicketAutocomplete)
    const models = brands?.find((b) => b.value?.toLowerCase() === watch('deviceBrand')?.toLowerCase())?.models ?? []

    const [showCreateModal, setShowCreateModal] = useState(false)
    return (
        <>
            <AddClient
                isModalOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
                onSuccess={(user) => setValue('client', user)}
            />
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className='modalForm ticketForm'>
                <Form labelWrap>
                    <Space direction='vertical' className='w-100'>
                        <Row gutter={[16, 16]} justify='space-evenly' className='w-100' wrap>
                            <Col flex='auto'>
                                <ClientForm
                                    user={watch('client')}
                                    withClient={watch('withClient')}
                                    setWithClient={(val) => setValue('withClient', val)}
                                    onChange={(user) => {
                                        if (validUserForTicket(user) && getValues('withClient')) {
                                            setValue('client', user)
                                        } else setValue('client', undefined)
                                    }}
                                />
                            </Col>

                            <Col flex='auto'>
                                <Space.Compact
                                    direction='vertical'
                                    className='w-100'
                                    key={ticket?.id + 'brand_model_password'}
                                >
                                    <Controller
                                        control={control}
                                        name={'deviceBrand'}
                                        render={({ field, fieldState }) => (
                                            <AntFormField label='Brand' error={fieldState.error}>
                                                <AutoComplete
                                                    options={brands}
                                                    value={field.value}
                                                    filterOption
                                                    onChange={(newValue) => {
                                                        setValue('deviceModel', '')
                                                        field.onChange(newValue)
                                                    }}
                                                    allowClear
                                                />
                                            </AntFormField>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name={'deviceModel'}
                                        render={({ field, fieldState }) => (
                                            <AntFormField label='Model' error={fieldState.error}>
                                                <AutoComplete
                                                    options={models}
                                                    value={field.value}
                                                    filterOption
                                                    onChange={(newValue) => field.onChange(newValue)}
                                                    allowClear
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
                            </Col>
                            <Col flex={'auto'}>
                                <Card size='small' style={{ margin: 'auto' }}>
                                    <Space className={'col-wrap'} direction={'vertical'}>
                                        <TicketQuickCheckBox
                                            key={'bag_' + watch('accessories')}
                                            fieldToCheck={watch('accessories')}
                                            name={'With bag'}
                                            value={'With Bag, '}
                                            onChange={(string) => {
                                                setValue('accessories', string)
                                            }}
                                        />
                                        <TicketQuickCheckBox
                                            key={'charger_' + watch('accessories')}
                                            fieldToCheck={watch('accessories')}
                                            name={'With charger'}
                                            value={'With Charger, '}
                                            onChange={(string) => {
                                                setValue('accessories', string)
                                            }}
                                        />
                                        <TicketQuickCheckBox
                                            key={'case_' + watch('accessories')}
                                            fieldToCheck={watch('accessories')}
                                            name={'With case'}
                                            value={'With Case, '}
                                            onChange={(string) => {
                                                setValue('accessories', string)
                                            }}
                                        />
                                        <TicketQuickCheckBox
                                            key={'box_' + watch('deviceCondition')}
                                            fieldToCheck={watch('deviceCondition')}
                                            name={'Dead device'}
                                            value={'Dead device, '}
                                            onChange={(string) => {
                                                setValue('deviceCondition', string)
                                            }}
                                        />
                                        <TicketQuickCheckBox
                                            key={'screen_' + watch('deviceCondition')}
                                            fieldToCheck={watch('deviceCondition')}
                                            name={'Cracked Screen'}
                                            value={'Cracked Screen, '}
                                            onChange={(string) => {
                                                setValue('deviceCondition', string)
                                            }}
                                        />
                                        <TicketQuickCheckBox
                                            key={'cracked_back_' + watch('deviceCondition')}
                                            fieldToCheck={watch('deviceCondition')}
                                            name={'Cracked Back'}
                                            value={'Cracked Back, '}
                                            onChange={(string) => {
                                                setValue('deviceCondition', string)
                                            }}
                                        />
                                        <label>
                                            <Checkbox
                                                key={'location_' + watch('deviceLocation')}
                                                checked={watch('deviceLocation') === 'With customer'}
                                                onChange={(e) => {
                                                    e.target.checked
                                                        ? setValue('deviceLocation', 'With customer')
                                                        : setValue('deviceLocation', defaultTicket.deviceLocation!)
                                                }}
                                            />{' '}
                                            Device stays with customer
                                        </label>
                                    </Space>
                                </Card>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]} justify='space-evenly' className='w-100' wrap>
                            <Col flex='auto'>
                                <Space.Compact direction='vertical' className='w-100'>
                                    <Controller
                                        control={control}
                                        name={'problemExplanation'}
                                        render={({ field: { onChange, value }, fieldState }) => (
                                            <AntFormField label='Task' error={fieldState.error}>
                                                <AutoComplete
                                                    status={fieldState?.error ? 'error' : undefined}
                                                    placeholder='What needs to be done?'
                                                    title='Task'
                                                    options={getTicketAutofill(ticketTaskAutocompleteList)}
                                                    onChange={onChange}
                                                    value={value}
                                                />
                                            </AntFormField>
                                        )}
                                    />
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
                                    <TaskDeadline
                                        control={control}
                                        name='deadline'
                                        label={'Deadline:'}
                                        duration={watch('deadlineDuration')}
                                        setDuration={(duration) => setValue('deadlineDuration', duration)}
                                    />
                                </Space.Compact>
                            </Col>
                            <Col flex='auto'>
                                <Card title='Payment' size='small'>
                                    <Space.Compact direction='vertical' className='w-100'>
                                        <AntTextField<CreateTicket>
                                            control={control}
                                            name='deposit'
                                            inputMode={'numeric'}
                                            placeholder='Deposit'
                                            label={'Deposit'}
                                            prefix='£'
                                            type='currency'
                                        />
                                        <AntTextField<CreateTicket>
                                            control={control}
                                            name='totalPrice'
                                            inputMode={'numeric'}
                                            placeholder='Total price'
                                            label={'Total price'}
                                            prefix='£'
                                            type='currency'
                                        />
                                    </Space.Compact>
                                </Card>
                            </Col>
                        </Row>
                        <Collapse
                            size='small'
                            items={[
                                {
                                    label: 'More details',
                                    forceRender: true,
                                    destroyInactivePanel: false,
                                    children: (
                                        <Space wrap className='justify-between'>
                                            <AntTextField<CreateTicket>
                                                label='Imei'
                                                control={control}
                                                name='serialNumberOrImei'
                                                placeholder={'Serial number / IMEI'}
                                                addonAfter={
                                                    <BarcodeReaderButton
                                                        title='Scan'
                                                        onScan={(scanResult) =>
                                                            setValue('serialNumberOrImei', scanResult)
                                                        }
                                                    />
                                                }
                                            />
                                            <AntTextField
                                                control={control}
                                                name={'deviceCondition'}
                                                label={'Device condition'}
                                                placeholder={'Device condition'}
                                            />
                                            <AntTextField
                                                control={control}
                                                name={'accessories'}
                                                label={'Accessories'}
                                                placeholder={'Accessories'}
                                            />
                                            <div className='flex-100 justify-between flex-wrap'>
                                                <div>
                                                    <Controller
                                                        control={control}
                                                        name={'status'}
                                                        render={({ field, fieldState }) => (
                                                            <FormField label='Ticket status' error={fieldState.error}>
                                                                <AppSelect<string, ItemPropertyView>
                                                                    options={TicketStatusesArray}
                                                                    placeholder='Select or add a new user'
                                                                    value={field.value}
                                                                    onChange={(newValue) => field.onChange(newValue)}
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
                                                            <FormField label='Device Location' error={fieldState.error}>
                                                                <AppCreatableSelect<ItemPropertyView>
                                                                    options={locations}
                                                                    placeholder='Where is the location of the device?'
                                                                    value={field.value}
                                                                    onChange={(newValue) => field.onChange(newValue)}
                                                                    getOptionLabel={(item) => item.value}
                                                                    getOptionValue={(item) => item.value}
                                                                />
                                                            </FormField>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Space>
                </Form>
                <FormError error={errors.root?.message} />
            </form>
        </>
    )
}

type LabeledUser = User & { label: string; value: string }

const ClientForm = ({
    user,
    onChange,
    withClient,
    setWithClient,
}: {
    user?: Partial<User>
    withClient?: boolean
    setWithClient: (withClient: boolean) => void

    onChange: (user?: Partial<User>) => void
}) => {
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
            className='w-100'
            type='inner'
            size='small'
            title={
                <Space>
                    <Switch title='Client toggle' onChange={setWithClient} value={withClient} />
                    {!withClient ? 'No client' : userExists ? `Selected client` : 'Creating a new client'}
                </Space>
            }
            extra={
                withClient && (
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
                )
            }
        >
            <Skeleton loading={!withClient} title={false}>
                <Space direction='vertical'>
                    <Select<Array<string>, LabeledUser>
                        {...props}
                        value={user?.phones ? [user.phones.join(', ')] : []}
                        placeholder='Phone number'
                        options={options.map((user) => ({ ...user, label: user.phones?.join(', ') }))}
                        onSearch={(value) => {
                            const search = parsePhone(value).phone
                            setFilter({ phone: search || value })
                            onChange(userExists ? undefined : { ...user, phones: undefined })
                        }}
                        onSelect={(value: string, option) => {
                            const newPhone = getPhoneString(parsePhone(value))
                            onChange(option.userId ? option : { ...user, phones: [newPhone] })
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
                        placeholder='Name'
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
            </Skeleton>
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
        <AntFormField
            label='Notes'
            extra={
                <Tooltip title={tempNotes} open={!!tempNotes}>
                    <Dictaphone
                        isActive={activeDictaphone === key}
                        dictaphoneKey={key}
                        setActiveDictaphone={setActiveDictaphone}
                        setText={(text) => onChange((value ?? '') + ' ' + text)}
                        setTempText={setTempNotes}
                    />
                </Tooltip>
            }
        >
            <TextArea onChange={(e) => onChange(e.target.value)} value={value ?? ''} />
        </AntFormField>
    )
}

export const formatDeadline = (ticket: CreateTicket) => {
    if (ticket.deadlineDuration != undefined) {
        ticket.deadline = moment().add(ticket.deadlineDuration).toDate()
        ticket.deadlineDuration = undefined
    }
    return ticket.deadline
}

const validUserForTicket = (user: Partial<User> | undefined) => {
    console.log(user)
    return user && (user?.userId || user?.email || (user?.phones && user?.phones?.length > 0) || user?.fullName)
}
