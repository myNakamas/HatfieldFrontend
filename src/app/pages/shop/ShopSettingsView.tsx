import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { getShopById, updateShop } from '../../axios/http/shopRequests'
import { useNavigate, useParams } from 'react-router-dom'
import { Shop } from '../../models/interfaces/shop'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ShopSchema } from '../../models/validators/FormValidators'
import { TextField } from '../../components/form/TextField'
import { FormField } from '../../components/form/Field'
import { CustomSuspense } from '../../components/CustomSuspense'
import { toast } from 'react-toastify'
import { FormError } from '../../components/form/FormError'
import { toastProps } from '../../components/modals/ToastProps'
import {
    Anchor,
    Breadcrumb,
    Button,
    Card,
    Collapse,
    ColorPicker,
    Descriptions,
    Divider,
    Input,
    Popover,
    Space,
    Switch,
    Typography,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import ReactMarkdown from 'react-markdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faClock, faQuestion, faX } from '@fortawesome/free-solid-svg-icons'
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor'
import ButtonGroup from 'antd/es/button/button-group'
import { sendSmsApiBalanceCheck, SmsBalanceResponse } from '../../axios/http/smsRequests'
import { postPrintExample } from '../../axios/http/documentRequests'
import { AppError } from '../../models/interfaces/generalModels'

export const ShopSettingsView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data: shop, isLoading } = useQuery(['shop', id], () => getShopById(Number(id)), {})
    const isPrintPossible =
        shop?.shopSettingsView.printEnabled && shop?.shopSettingsView.printerIp && shop?.shopSettingsView.printerModel
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
        watch,
    } = useForm<Shop>({
        resolver: yupResolver(ShopSchema),
        defaultValues: shop,
    })
    useEffect(() => reset(shop), [shop])

    const submitShop = (formValue: Shop) => {
        toast
            .promise(
                updateShop(formValue),
                { pending: 'Sending', success: 'Edited shop successfully', error: 'Failed ' },
                toastProps
            )
            .then(() => {
                queryClient.invalidateQueries(['shop', id]).then()
            })
            .catch((error) => {
                setError('root', { message: error })
            })
    }

    const printExample = () => {
        postPrintExample()
            .then(() => {
                toast.success('Print has been successfull!', toastProps)
            })
            .catch((error: AppError) => {
                toast.error('Print failed: ' + error.title + ':' + error.detail, toastProps)
            })
    }

    return (
        <div className='mainScreen'>
            <Breadcrumb
                items={[
                    { title: <a onClick={() => navigate('/home')}>Home</a> },
                    { title: <a onClick={() => navigate('/shops')}>Shops</a> },
                    { title: shop?.shopName },
                ]}
            />
            <CustomSuspense isReady={!isLoading}>
                <Space className={'flex-100 align-start justify-around'}>
                    {window.innerWidth >= 768 && <Anchor items={pageAnchors} />}
                    <form className='modalForm width-m' onSubmit={handleSubmit(submitShop)}>
                        <div className='justify-around flex-100 flex-wrap align-start'>
                            <Divider>Shop Information</Divider>

                            <div className='w-100 mb-1'>
                                <Card id='shopInf' title={'Shop information'} className='w-100'>
                                    <TextField
                                        label={'Shop name'}
                                        register={register('shopName')}
                                        error={errors.shopName}
                                    />
                                    <TextField
                                        label={'Address'}
                                        register={register('address')}
                                        error={errors.address}
                                    />
                                    <TextField
                                        label={'Company Email'}
                                        register={register('email')}
                                        inputMode={'email'}
                                        error={errors.email}
                                        type='email'
                                    />
                                    <TextField
                                        label={'Phone number'}
                                        register={register('phone')}
                                        inputMode={'tel'}
                                        error={errors.phone}
                                    />
                                    <TextField
                                        label={'REG number'}
                                        register={register('regNumber')}
                                        error={errors.regNumber}
                                    />
                                    <TextField
                                        label={'VAT number'}
                                        register={register('vatNumber')}
                                        error={errors.vatNumber}
                                    />
                                </Card>
                            </div>
                            <div className='w-100 mb-1'>
                                <Card id={'shopCol'} title={'Shop Colors'} className='w-100'>
                                    <Space className='w-100 justify-start align-start' direction={'vertical'}>
                                        <Controller
                                            control={control}
                                            name='shopSettingsView.primaryColor'
                                            render={({ field, fieldState }) => (
                                                <FormField label={'Primary color of the shop'} error={fieldState.error}>
                                                    <ColorPicker
                                                        format={'hex'}
                                                        value={field.value}
                                                        onChange={(val, hex) => field.onChange(hex)}
                                                    />
                                                </FormField>
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name='shopSettingsView.secondaryColor'
                                            render={({ field, fieldState }) => (
                                                <FormField
                                                    label={'Secondary color of the shop'}
                                                    error={fieldState.error}
                                                >
                                                    <ColorPicker
                                                        format={'hex'}
                                                        value={field.value}
                                                        onChange={(val, hex) => field.onChange(hex)}
                                                    />
                                                </FormField>
                                            )}
                                        />
                                    </Space>
                                </Card>
                            </div>
                            <Divider>Templates</Divider>
                            <div id={'templates'} className='w-100 mb-1'>
                                <Card
                                    className='mb-1'
                                    id={'aboutPage'}
                                    title={'About page settings'}
                                    extra={<AboutPagePopover />}
                                >
                                    <Controller
                                        control={control}
                                        render={({ field, fieldState }) => {
                                            const [preview, setPreview] = useState(false)
                                            return (
                                                <Space direction={'vertical'} className={'w-100'}>
                                                    <ButtonGroup>
                                                        <Button
                                                            type={preview ? 'primary' : 'default'}
                                                            onClick={() => setPreview(true)}
                                                        >
                                                            Preview
                                                        </Button>
                                                        <Button
                                                            type={preview ? 'default' : 'primary'}
                                                            onClick={() => setPreview(false)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </ButtonGroup>
                                                    {preview ? (
                                                        <Card bordered>
                                                            <ReactMarkdown children={field.value} />
                                                        </Card>
                                                    ) : (
                                                        <TextArea
                                                            className={'w-100'}
                                                            onChange={field.onChange}
                                                            showCount
                                                            value={field.value ?? ''}
                                                            size='large'
                                                            bordered
                                                            status={fieldState.error ? 'error' : ''}
                                                        />
                                                    )}
                                                </Space>
                                            )
                                        }}
                                        name={'templates.aboutPage'}
                                    />
                                </Card>
                            </div>
                            <Divider>System Settings</Divider>

                            <div id={'sysSettings'} className='w-100 mb-1'>
                                <Card
                                    id={'printConf'}
                                    title={'Print configuration'}
                                    className='mb-1'
                                    extra={
                                        <Controller
                                            control={control}
                                            render={({ field }) => (
                                                <Space>
                                                    {field.value ? 'Enabled' : 'Disabled'}
                                                    <Switch checked={field.value} onChange={field.onChange} />
                                                </Space>
                                            )}
                                            name={'shopSettingsView.printEnabled'}
                                        />
                                    }
                                >
                                    <Typography>
                                        <p>Please provide the following information for printer setup:</p>
                                        <ol>
                                            <li>
                                                Local Printer IP: Enter the IP address of the printer connected to your
                                                network.
                                            </li>
                                            <li>
                                                Printer Model: Specify the model of the printer you are configuring.
                                            </li>
                                        </ol>
                                        <p>
                                            Ensure accurate information entry for seamless printing. Click "Save" to
                                            apply changes.
                                        </p>
                                        <p>
                                            Note: Refer to the printer's manual or contact support if you encounter any
                                            issues.
                                        </p>
                                    </Typography>
                                    <TextField
                                        disabled={!watch('shopSettingsView.printEnabled')}
                                        label='Printer IP (Local)'
                                        inputMode={'numeric'}
                                        register={register('shopSettingsView.printerIp')}
                                        error={errors.shopSettingsView?.printerIp}
                                    />
                                    <TextField
                                        disabled={!watch('shopSettingsView.printEnabled')}
                                        label='Printer Model'
                                        register={register('shopSettingsView.printerModel')}
                                        error={errors.shopSettingsView?.printerModel}
                                    />
                                    <Popover
                                        content={isPrintPossible ? '' : 'Printing not possible: Invalid configuration'}
                                    >
                                        <Button onClick={printExample} disabled={!isPrintPossible} type='primary'>
                                            Print an example image
                                        </Button>
                                    </Popover>
                                </Card>
                                <Card
                                    id='emailConf'
                                    className='mb-1'
                                    title={'Email notifications'}
                                    extra={
                                        <Controller
                                            control={control}
                                            render={({ field }) => (
                                                <Space>
                                                    {field.value ? 'Enabled' : 'Disabled'}
                                                    <Switch checked={field.value} onChange={field.onChange} />
                                                </Space>
                                            )}
                                            name={'shopSettingsView.emailNotificationsEnabled'}
                                        />
                                    }
                                >
                                    <Typography>
                                        <p>
                                            Use this section to configure the email address and password for the email
                                            notification system. Please provide the credentials for the Gmail account
                                            that will be used to send email notifications.
                                        </p>
                                        <p>
                                            You can also use an{' '}
                                            <a href={'https://support.google.com/accounts/answer/185833'}>
                                                application password
                                            </a>{' '}
                                            instead of the email password.
                                        </p>
                                        <p>
                                            For Gmail users, please make sure that you allow less secure apps access by
                                            following the instructions{' '}
                                            <a href='https://support.google.com/accounts/answer/6010255'>here</a>.
                                        </p>
                                    </Typography>
                                    <TextField
                                        disabled={!watch('shopSettingsView.emailNotificationsEnabled')}
                                        label='Notification email'
                                        inputMode={'email'}
                                        register={register('shopSettingsView.gmail')}
                                        error={errors.shopSettingsView?.gmail}
                                    />
                                    <TextField
                                        disabled={!watch('shopSettingsView.emailNotificationsEnabled')}
                                        label='Notification email password'
                                        register={register('shopSettingsView.gmailPassword')}
                                        type='password'
                                        autoComplete='password'
                                        error={errors.shopSettingsView?.gmailPassword}
                                    />
                                </Card>
                                <Card
                                    className='mb-1'
                                    id='smsConf'
                                    title={'SMS notifications'}
                                    extra={
                                        <Controller
                                            control={control}
                                            render={({ field }) => (
                                                <Space>
                                                    {field.value ? 'Enabled' : 'Disabled'}
                                                    <Switch checked={field.value} onChange={field.onChange} />
                                                </Space>
                                            )}
                                            name={'shopSettingsView.smsNotificationsEnabled'}
                                        />
                                    }
                                >
                                    <Space direction={'vertical'}>
                                        <SMSFieldDescription />
                                        <TextField
                                            disabled={!watch('shopSettingsView.smsNotificationsEnabled')}
                                            label='SMS API key'
                                            register={register('shopSettingsView.smsApiKey')}
                                            type='password'
                                            autoComplete='api-key'
                                            error={errors.shopSettingsView?.smsApiKey}
                                        />
                                        <TestSmsToken token={watch('shopSettingsView.smsApiKey')} />
                                    </Space>
                                </Card>
                            </div>
                        </div>

                        <FormError error={errors.root?.message} />
                        <Space className='flex-100 justify-between'>
                            <Button.Group>
                                <Button type='primary' htmlType={'submit'}>
                                    Save
                                </Button>
                                <Button htmlType='button' onClick={() => reset(shop)}>
                                    Reset
                                </Button>
                            </Button.Group>

                            <Button htmlType='button' onClick={() => navigate('/shops/')}>
                                Cancel
                            </Button>
                        </Space>
                    </form>
                </Space>
            </CustomSuspense>
        </div>
    )
}

const TestSmsToken = ({ token }: { token: string }) => {
    const [response, setResponse] = useState<SmsBalanceResponse | undefined>()
    const [error, setError] = useState<boolean>()
    return (
        <Space.Compact>
            <Button
                onClick={() =>
                    sendSmsApiBalanceCheck(token)
                        .then((res) => {
                            setResponse(res)
                            setError(false)
                        })
                        .catch(() => {
                            setResponse(undefined)
                            setError(true)
                        })
                }
            >
                Test Connection
            </Button>
            <Input
                status={error ? 'error' : ''}
                readOnly
                value={response?.data ? `OK! Balance left: ${response?.data.balance} ` : error ? 'Error' : ''}
            />
            <Button
                type={'text'}
                disabled
                icon={<FontAwesomeIcon icon={response?.data ? faCheck : error ? faX : faClock} />}
            />
        </Space.Compact>
    )
}

const AboutPagePopover = () => (
    <Popover
        overlayClassName={'width-m'}
        content={
            <div>
                <p>
                    Please provide the content of the shop's About page using the{' '}
                    <a href={'https://www.markdownguide.org/basic-syntax/'}>Markdown format</a>.
                </p>
                <p>You can include the actual shop information to the page using these variables:</p>
                <Descriptions title={'Variables'}>
                    <Descriptions.Item label={"The shop's name"} children='${shop.name}' />
                    <Descriptions.Item label={"The shop's email address"} children='${shop.email}' />
                    <Descriptions.Item label={"The shop's phone number"} children='${shop.phone}' />
                    <Descriptions.Item label={"The shop's physical address"} children='${shop.address}' />
                </Descriptions>
            </div>
        }
    >
        <Button icon={<FontAwesomeIcon icon={faQuestion} />} />
    </Popover>
)
const SMSFieldDescription = () => (
    <Typography>
        <Collapse
            items={[
                {
                    key: '1',
                    label: 'Please follow these steps to acquire your unique API key:',
                    children: (
                        <ol>
                            <li>
                                Open your web browser and navigate to the{' '}
                                <a href='https://app.d7networks.com/api-tokens'>API Tokens page</a> by visiting the
                                following URL: <code>https://app.d7networks.com/api-tokens</code>.
                            </li>
                            <li>
                                Once you're on the API Tokens page, you'll need to log in to your account or create a
                                new one if you don't have an account already.
                            </li>
                            <li>
                                After logging in, you will find an option to generate a new API key. Click on the
                                "Generate New API Key" button or a similar option available on the page.
                            </li>
                            <li>
                                The system will generate a unique API key for you. This API key is a confidential
                                credential that provides secure access to our API services.
                            </li>
                            <li>
                                Copy the generated API key to your clipboard. Make sure to keep this key confidential,
                                as it grants access to your account and our API services.
                            </li>
                            <li>
                                Return to this page and paste the copied API key into the text field provided below.
                            </li>
                        </ol>
                    ),
                },
            ]}
        />
    </Typography>
)
const pageAnchors: AnchorLinkItemProps[] = [
    {
        key: 'part-1',
        href: '#shopInf',
        title: 'Shop Information',
        children: [
            {
                key: 'part-1-2',
                href: '#shopCol',
                title: 'Shop Colors',
            },
        ],
    },
    {
        key: 'part-2',
        href: '#templates',
        title: 'Templates',
        children: [
            {
                key: 'part-2-1',
                href: '#aboutPage',
                title: 'About Page content',
            },
        ],
    },
    {
        key: 'part-3',
        href: '#sysSettings',
        title: 'System settings',
        children: [
            {
                key: 'part-3-1',
                href: '#printConf',
                title: 'Print configuration',
            },
            {
                key: 'part-3-2',
                href: '#emailConf',
                title: 'Email Configuration',
            },
            {
                key: 'part-3-3',
                href: '#smsConf',
                title: 'SMS configuration',
            },
        ],
    },
]
