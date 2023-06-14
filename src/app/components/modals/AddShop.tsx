import React, { useContext, useEffect, useRef } from 'react'
import { AppModal } from './AppModal'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ShopSchema } from '../../models/validators/FormValidators'
import { Shop } from '../../models/interfaces/shop'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from './ToastProps'
import { createShop } from '../../axios/http/shopRequests'
import { TextField } from '../form/TextField'
import { FormError } from '../form/FormError'
import { useQueryClient } from 'react-query'
import { Button, Card, ColorPicker, Space } from 'antd'
import { FormField } from '../form/Field'
import { ThemeContext } from '../../contexts/ThemeContext'
import { AuthContext } from '../../contexts/AuthContext'
import { AppError } from '../../models/interfaces/generalModels'

export const AddShop = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const { isAdmin } = useContext(AuthContext)
    const formRef = useRef<HTMLFormElement>(null)
    const queryClient = useQueryClient()
    const { colors } = useContext(ThemeContext)
    const primaryColorSample = document.getElementById('primaryColorSample')
    const secondaryColorSample = document.getElementById('secondaryColorSample')
    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
        setError,
    } = useForm<Shop>({
        resolver: yupResolver(ShopSchema),
    })
    useEffect(() => {
        formRef.current?.reset()
    }, [isModalOpen])

    const saveShop = (data: Shop) => {
        toast
            .promise(createShop(data), toastCreatePromiseTemplate('shop'), toastProps)
            .then(() => {
                closeModal()
                queryClient.invalidateQueries(['shops']).then()
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }

    useEffect(() => {
        if (primaryColorSample) primaryColorSample.style.backgroundColor = colors?.primaryColor ?? ''
        if (secondaryColorSample) secondaryColorSample.style.backgroundColor = colors?.secondaryColor ?? ''
    }, [colors])

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title={'Shop'} isForbidden={!isAdmin()}>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit((data) => saveShop(data))}>
                <div className='card'>
                    <TextField label={'Shop name'} register={register('shopName')} error={errors.shopName} />
                    <TextField label={'Address'} register={register('address')} error={errors.address} />
                    <TextField label={'Company Email'} register={register('email')} error={errors.email} type='email' />
                    <TextField label={'Phone number'} register={register('phone')} error={errors.phone} />
                    <TextField label={'REG number'} register={register('regNumber')} error={errors.regNumber} />
                    <TextField label={'VAT number'} register={register('vatNumber')} error={errors.vatNumber} />

                    <Card title={'Shop Colors'} className='w-100'>
                        <Space className='w-100 justify-around align-center' direction={'horizontal'} wrap>
                            <Controller
                                control={control}
                                name='shopSettingsView.primaryColor'
                                render={({ field, fieldState }) => (
                                    <FormField label={'Primary color of the shop'} error={fieldState.error}>
                                        <ColorPicker value={field.value} onChange={field.onChange} />
                                    </FormField>
                                )}
                            />
                            <Controller
                                control={control}
                                name='shopSettingsView.secondaryColor'
                                render={({ field, fieldState }) => (
                                    <FormField label={'Secondary color of the shop'} error={fieldState.error}>
                                        <ColorPicker value={field.value} onChange={field.onChange} />
                                    </FormField>
                                )}
                            />
                        </Space>
                    </Card>

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
                    <FormError error={errors.root?.message} />
                    <div className='flex-100 justify-end'>
                        <Button type='primary' onClick={handleSubmit(saveShop)}>
                            Save
                        </Button>
                        <Button htmlType='button' onClick={() => closeModal()}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </AppModal>
    )
}
