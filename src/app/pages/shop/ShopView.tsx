import React, { useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { getShopById, updateShop } from '../../axios/http/shopRequests';
import { useParams } from 'react-router-dom';
import { Shop, ShopSettingsModel } from '../../models/interfaces/shop';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { ShopSchema } from '../../models/validators/FormValidators';
import { TextField } from '../../components/form/TextField';
import { HexColorPicker } from 'react-colorful';
import { FormField } from '../../components/form/Field';
import { CustomSuspense } from '../../components/CustomSuspense';
import { ThemeContext } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { FormError } from '../../components/form/FormError';
import { toastProps } from '../../components/modals/ToastProps';

export const ShopView = () => {
    const { id } = useParams()
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
        toast.promise(
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
    }

    useEffect(() => {
        if (primaryColorSample) primaryColorSample.style.backgroundColor = colors?.primaryColor ?? ''
        if (secondaryColorSample) secondaryColorSample.style.backgroundColor = colors?.secondaryColor ?? ''
    }, [colors])

    return (
        <div className='mainScreen'>
            <CustomSuspense isReady={!isLoading}>
                <form className='modalForm width-m' onSubmit={handleSubmit(submitShop)}>
                    <h3>Shop information</h3>
                    <div className='card'>
                        <TextField label={'Shop name'} register={register('shopName')} error={errors.shopName} />
                        <TextField label={'Address'} register={register('address')} error={errors.address} />
                        <TextField
                            label={'Company Email'}
                            register={register('email')}
                            error={errors.email}
                            type='email'
                        />
                        <TextField label={'Phone number'} register={register('phone')} error={errors.phone} />
                        <TextField label={'REG number'} register={register('regNumber')} error={errors.regNumber} />
                        <TextField label={'VAT number'} register={register('vatNumber')} error={errors.vatNumber} />
                    </div>

                    <h3>Shop Colors</h3>
                    <div className='card flex justify-around'>
                        <Controller
                            control={control}
                            name='shopSettingsView.primaryColor'
                            render={({ field, fieldState }) => (
                                <FormField label={'Primary color of the shop'} error={fieldState.error}>
                                    <HexColorPicker
                                        defaultValue={colors?.primaryColor}
                                        color={field.value}
                                        onChange={(color) => {
                                            if (primaryColorSample) primaryColorSample.style.backgroundColor = color
                                            field.onChange(color)
                                        }}
                                    />
                                    <input className='input' onChange={field.onChange} value={field.value ?? ''} />
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
                                            if (secondaryColorSample) secondaryColorSample.style.backgroundColor = color
                                            field.onChange(color)
                                        }}
                                    />
                                    <input className='input' onChange={field.onChange} value={field.value ?? ''} />
                                </FormField>
                            )}
                        />
                        <div>
                            <h4>Color sample:</h4>
                            <div id='primaryColorSample' className='colorSample' />
                            <div id='secondaryColorSample' className='colorSample' />
                        </div>
                    </div>

                    <h3>Shop Settings</h3>
                    <div className='card'>
                        <TextField
                            label='Notification email'
                            register={register('shopSettingsView.gmail')}
                            error={errors.shopSettingsView?.gmail}
                        />
                        <TextField
                            label='Notification email password'
                            register={register('shopSettingsView.gmailPassword')}
                            type='password'
                            error={errors.shopSettingsView?.gmailPassword}
                        />
                        <TextField
                            label='SMS API key'
                            register={register('shopSettingsView.smsApiKey')}
                            type='password'
                            error={errors.shopSettingsView?.smsApiKey}
                        />
                    </div>
                    <FormError error={errors.root?.message} />
                    <div className='flex-100 justify-end'>
                        <button className='successButton' onClick={handleSubmit(submitShop)}>
                            Save
                        </button>
                        <button className='cancelButton' type='button' onClick={() => resetForm(shop)}>
                            Reset
                        </button>
                    </div>
                </form>
            </CustomSuspense>
        </div>
    )
}
