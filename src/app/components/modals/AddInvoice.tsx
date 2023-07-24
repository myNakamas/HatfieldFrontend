import { CreateItemInvoice } from '../../models/interfaces/invoice'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../form/TextField'
import { AppModal } from './AppModal'
import { Button, Card, Space } from 'antd'
import { getAllClients } from '../../axios/http/userRequests'
import { FormField } from '../form/Field'
import Select from 'react-select'
import { User } from '../../models/interfaces/user'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import {
    defaultInvoice,
    InvoiceType,
    InvoiceTypesArray,
    PaymentMethodList,
    WarrantyPeriodList,
} from '../../models/enums/invoiceEnums'
import { AppError, ItemPropertyView } from '../../models/interfaces/generalModels'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AddClient } from './users/AddClient'
import { NewInvoiceSchema } from '../../models/validators/FormValidators'
import { yupResolver } from '@hookform/resolvers/yup'
import { InventoryItem } from '../../models/interfaces/shop'
import { getAllBrands } from '../../axios/http/shopRequests'
import { createInvoice } from '../../axios/http/invoiceRequests'
import { toastCreatePromiseTemplate, toastProps } from './ToastProps'
import { toast } from 'react-toastify'
import { FormError } from '../form/FormError'
import { getUserString } from '../../utils/helperFunctions'
import { AuthContext } from '../../contexts/AuthContext'
import { openInvoicePdf } from '../../pages/invoices/Invoices'
import TextArea from 'antd/es/input/TextArea'

export const AddInvoice = ({
    item,
    isModalOpen,
    closeModal,
}: {
    item?: InventoryItem
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const { isWorker } = useContext(AuthContext)
    const formRef = useRef<HTMLFormElement>(null)
    const { data: clients } = useQuery(['users', 'clients'], () => getAllClients({}), {
        enabled: isWorker(),
    })
    const queryClient = useQueryClient()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const defaultValues = item
        ? {
              ...defaultInvoice,
              count: 1,
              itemId: item.id,
              deviceBrand: item.brand,
              deviceModel: item.model,
              totalPrice: item.sellPrice,
              type: 'SELL' as InvoiceType,
          }
        : defaultInvoice

    const {
        control,
        handleSubmit,
        register,
        setValue,
        formState: { errors },
        reset,
        setError,
        watch,
    } = useForm<CreateItemInvoice>({
        defaultValues,
        resolver: yupResolver(NewInvoiceSchema),
    })
    const { data: brands } = useQuery('brands', getAllBrands)
    const models = brands?.find((b) => b.value === watch('deviceBrand'))?.models ?? []
    useEffect(() => {
        formRef.current?.reset()
        reset(defaultValues)
    }, [isModalOpen])

    const saveInvoice = (data: CreateItemInvoice) => {
        const body: CreateItemInvoice = {
            ...data,
            deviceName: data.deviceBrand + ' ' + data.deviceModel,
            itemId: item?.id,
        }
        toast
            .promise(createInvoice(body), toastCreatePromiseTemplate('invoice'), toastProps)
            .then((id) => {
                closeModal()
                queryClient.invalidateQueries(['invoices']).then(() => {
                    openInvoicePdf(id)
                })
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }
    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title={'Create invoice'} isForbidden={!isWorker()}>
            <AddClient
                isModalOpen={showCreateModal}
                closeModal={() => setShowCreateModal(false)}
                onSuccess={(client) => setValue('clientId', client.userId)}
            />
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit(saveInvoice)}>
                <Space direction='vertical' className='w-100'>
                    <Space.Compact direction={'vertical'}>
                        <Controller
                            control={control}
                            name={'type'}
                            render={({ field, fieldState }) => (
                                <FormField label='Invoice type' error={fieldState.error}>
                                    <Select<ItemPropertyView, false>
                                        isClearable
                                        theme={SelectTheme}
                                        styles={SelectStyles<ItemPropertyView>()}
                                        options={InvoiceTypesArray}
                                        placeholder='Specify the type of the invoice'
                                        value={InvoiceTypesArray.find(({ value }) => value === field.value) ?? null}
                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                        getOptionLabel={(item) => item.value}
                                        getOptionValue={(item) => String(item.id)}
                                    />
                                </FormField>
                            )}
                        />
                        <Controller
                            control={control}
                            name={'clientId'}
                            render={({ field, fieldState }) => (
                                <FormField label='Client' error={fieldState.error}>
                                    <Space.Compact>
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
                                        >
                                            Create client
                                        </Button>
                                    </Space.Compact>
                                </FormField>
                            )}
                        />
                    </Space.Compact>

                    <Space wrap align={'start'}>
                        <Space direction={'vertical'}>
                            <Card title={'Device Info'}>
                                <Space direction={'vertical'}>
                                    <Space wrap>
                                        <Controller
                                            control={control}
                                            name={'deviceBrand'}
                                            render={({ field, fieldState }) => (
                                                <FormField label='Brand' error={fieldState.error}>
                                                    <Select<ItemPropertyView, false>
                                                        isClearable
                                                        theme={SelectTheme}
                                                        styles={SelectStyles<ItemPropertyView>()}
                                                        options={brands}
                                                        placeholder='Select or add a new brand'
                                                        value={
                                                            brands?.find(({ value }) => field.value === value) ?? {
                                                                value: field.value,
                                                                id: -1,
                                                            }
                                                        }
                                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                                        getOptionLabel={(item) => item.value}
                                                        getOptionValue={(item) => item.id + item.value}
                                                    />
                                                </FormField>
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name={'deviceModel'}
                                            render={({ field, fieldState }) => (
                                                <FormField label='Model' error={fieldState.error}>
                                                    <Select<ItemPropertyView, false>
                                                        isClearable
                                                        theme={SelectTheme}
                                                        styles={SelectStyles<ItemPropertyView>()}
                                                        options={models}
                                                        placeholder='Select or add a new brand'
                                                        value={
                                                            models?.find(({ value }) => field.value === value) ?? {
                                                                value: field.value,
                                                                id: -1,
                                                            }
                                                        }
                                                        onChange={(newValue) => field.onChange(newValue?.value)}
                                                        getOptionLabel={(item) => item.value}
                                                        getOptionValue={(item) => item.id + item.value}
                                                    />
                                                </FormField>
                                            )}
                                        />
                                    </Space>
                                    <Space wrap>
                                        <TextField
                                            label={'Count'}
                                            min={0}
                                            register={register('count')}
                                            error={errors.count}
                                            type='number'
                                        />
                                        <TextField
                                            label={'Serial number / IMEI'}
                                            register={register('serialNumber')}
                                            error={errors.serialNumber}
                                        />
                                    </Space>
                                </Space>
                            </Card>
                            <Controller
                                render={({ field }) => {
                                    return (
                                        <FormField label={'Notes'} error={errors.notes}>
                                            <TextArea onChange={field.onChange} value={field.value}></TextArea>
                                        </FormField>
                                    )
                                }}
                                name={'notes'}
                                control={control}
                            />
                        </Space>
                        <Card title={'Payment'}>
                            <Controller
                                control={control}
                                name={'paymentMethod'}
                                render={({ field, fieldState }) => (
                                    <FormField label='Payment method' error={fieldState.error}>
                                        <Select<ItemPropertyView, false>
                                            isClearable
                                            theme={SelectTheme}
                                            styles={SelectStyles<ItemPropertyView>()}
                                            options={PaymentMethodList}
                                            placeholder='Select a payment method'
                                            value={
                                                PaymentMethodList?.find(({ value }) => value === field.value) ?? null
                                            }
                                            onChange={(newValue) => field.onChange(newValue?.value)}
                                            getOptionLabel={(item) => item.value}
                                            getOptionValue={(item) => String(item.id)}
                                        />
                                    </FormField>
                                )}
                            />
                            <Controller
                                control={control}
                                name={'warrantyPeriod'}
                                render={({ field, fieldState }) => (
                                    <FormField label='Warranty period' error={fieldState.error}>
                                        <Select<ItemPropertyView, false>
                                            isClearable
                                            theme={SelectTheme}
                                            styles={SelectStyles<ItemPropertyView>()}
                                            options={WarrantyPeriodList}
                                            placeholder='Warranty period'
                                            value={WarrantyPeriodList?.find(({ value }) => value === field.value)}
                                            onChange={(newValue) => field.onChange(newValue?.value)}
                                            getOptionLabel={(item) => item.value}
                                            getOptionValue={(item) => String(item.id)}
                                        />
                                    </FormField>
                                )}
                            />
                            <TextField
                                label={'Invoice price'}
                                register={register('totalPrice')}
                                error={errors.totalPrice}
                            />
                        </Card>
                    </Space>
                </Space>
                <FormError error={errors.root?.message} />

                <div className='flex-100 justify-end'>
                    <Button type='primary' htmlType='submit'>
                        Save and show
                    </Button>
                    <Button htmlType='button' onClick={closeModal}>
                        Close
                    </Button>
                </div>
            </form>
        </AppModal>
    )
}
