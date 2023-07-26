import React, { useState } from 'react'
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
    ColorPicker,
    Descriptions,
    Divider,
    Popover,
    Space,
    Switch,
    Typography,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import ReactMarkdown from 'react-markdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'
import { AnchorLinkItemProps } from 'antd/es/anchor/Anchor'
import ButtonGroup from 'antd/es/button/button-group'

export const ShopSettingsView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { data: shop, isLoading } = useQuery(['shop', id], () => getShopById(Number(id)), {
        onSuccess: (data) => resetForm(data),
    })
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

    const resetForm = (data: Shop | undefined) => {
        reset(data)
    }

    const submitShop = (formValue: Shop) => {
        toast
            .promise(
                updateShop(formValue)
                    .then(() => {
                        queryClient.invalidateQueries(['shop', id]).then()
                    })
                    .catch((error) => {
                        setError('root', { message: error })
                    }),
                { pending: 'Sending', success: 'Edited shop successfully', error: 'Failed ' },
                toastProps
            )
            .then(() => navigate('/shops/'))
    }

    return (
        <div className='mainScreen'>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <a onClick={() => navigate('/home')}>Home</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <a onClick={() => navigate('/shops')}>Shops</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{shop?.shopName}</Breadcrumb.Item>
            </Breadcrumb>
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
                                    <TextField
                                        disabled={!watch('shopSettingsView.smsNotificationsEnabled')}
                                        label='SMS API key'
                                        register={register('shopSettingsView.smsApiKey')}
                                        type='password'
                                        error={errors.shopSettingsView?.smsApiKey}
                                    />
                                </Card>
                            </div>
                        </div>

                        <FormError error={errors.root?.message} />
                        <div className='flex-100 justify-end'>
                            <Button type='primary' htmlType={'submit'}>
                                Save
                            </Button>
                            <Button htmlType='button' onClick={() => navigate('/shops/')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Space>
            </CustomSuspense>
        </div>
    )
}

const AboutPagePopover = () => (
    <Popover
        overlayClassName={'width-m'}
        content={
            <div>
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
