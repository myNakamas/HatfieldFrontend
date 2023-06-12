import React, { useContext, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { getShopById, updateShop } from '../../axios/http/shopRequests'
import { useNavigate, useParams } from 'react-router-dom'
import { Shop, ShopSettingsModel } from '../../models/interfaces/shop'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ShopSchema } from '../../models/validators/FormValidators'
import { TextField } from '../../components/form/TextField'
import { HexColorPicker } from 'react-colorful'
import { FormField } from '../../components/form/Field'
import { CustomSuspense } from '../../components/CustomSuspense'
import { ThemeContext } from '../../contexts/ThemeContext'
import { toast } from 'react-toastify'
import { FormError } from '../../components/form/FormError'
import { toastProps } from '../../components/modals/ToastProps'
import { Button, Card, Space, Switch } from 'antd'

export const ShopView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { colors } = useContext(ThemeContext)
    const queryClient = useQueryClient()
    const { data: shop, isLoading } = useQuery(['shop', id], () => getShopById(Number(id)), {
        onSuccess: (data) => resetForm(data),
    })
    const primaryColorSample = document.getElementById('primaryColorSample')
    const secondaryColorSample = document.getElementById('secondaryColorSample')
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
        defaultValues: {
            ...shop,
            shopSettingsView: { ...shop?.shopSettingsView, gmailPassword: '' } as ShopSettingsModel,
        } as Shop,
    })

    const resetForm = (data: Shop | undefined) => {
        reset({
            ...data,
            shopSettingsView: { ...data?.shopSettingsView, gmailPassword: '' } as ShopSettingsModel,
        } as Shop)
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

    useEffect(() => {
        if (primaryColorSample) primaryColorSample.style.backgroundColor = colors?.primaryColor ?? ''
        if (secondaryColorSample) secondaryColorSample.style.backgroundColor = colors?.secondaryColor ?? ''
    }, [colors])

    return (
        <div className='mainScreen'>
            <CustomSuspense isReady={!isLoading}>
                <form className='modalForm width-m' onSubmit={handleSubmit(submitShop)}>
                    <div className='justify-around flex-100 flex-wrap align-start'>
                        <div className='w-100'>
                            <Card title={'Shop information'} className='w-100'>
                                <TextField
                                    label={'Shop name'}
                                    register={register('shopName')}
                                    error={errors.shopName}
                                />
                                <TextField label={'Address'} register={register('address')} error={errors.address} />
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
                        <div className='w-100'>
                            <Card title={'Shop Colors'} className='w-100'>
                                <Space className='w-100 justify-around align-center' direction={'horizontal'} wrap>
                                    <Controller
                                        control={control}
                                        name='shopSettingsView.primaryColor'
                                        render={({ field, fieldState }) => (
                                            <FormField label={'Primary color of the shop'} error={fieldState.error}>
                                                <HexColorPicker
                                                    color={field.value}
                                                    onChange={(color) => {
                                                        if (primaryColorSample)
                                                            primaryColorSample.style.backgroundColor = color
                                                        field.onChange(color)
                                                    }}
                                                />
                                                <input
                                                    className='input '
                                                    onChange={field.onChange}
                                                    value={field.value ?? ''}
                                                />
                                            </FormField>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name='shopSettingsView.secondaryColor'
                                        render={({ field, fieldState }) => (
                                            <FormField label={'Secondary color of the shop'} error={fieldState.error}>
                                                <HexColorPicker
                                                    color={field.value}
                                                    onChange={(color) => {
                                                        if (secondaryColorSample)
                                                            secondaryColorSample.style.backgroundColor = color
                                                        field.onChange(color)
                                                    }}
                                                />
                                                <input
                                                    className='input'
                                                    onChange={field.onChange}
                                                    value={field.value ?? ''}
                                                />
                                            </FormField>
                                        )}
                                    />
                                    <div className={'flex-wrap'}>
                                        <h4>Color sample:</h4>
                                        <div id='primaryColorSample' className='colorSample' />
                                        <div id='secondaryColorSample' className='colorSample' />
                                    </div>
                                </Space>
                            </Card>
                        </div>
                        <div className='w-100'>
                            <h3>System Settings</h3>
                            <Card
                                title={'Print configuration'}
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
                        <Button type='primary' onClick={handleSubmit(submitShop)}>
                            Save
                        </Button>
                        <Button htmlType='button' onClick={() => navigate('/shops/')}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CustomSuspense>
        </div>
    )
}
