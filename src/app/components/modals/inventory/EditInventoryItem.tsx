import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { EditItemInventorySchema } from '../../../models/validators/FormValidators'
import { Category, CreateInventoryItem, InventoryItem } from '../../../models/interfaces/shop'
import {
    addCategory,
    getAllBrands,
    getAllCategories,
    getShopData,
    putUpdateItem,
} from '../../../axios/http/shopRequests'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { AppModal } from '../AppModal'
import React, { useEffect, useState } from 'react'
import { FormField } from '../../form/Field'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { Button, Card, Input, Space, Tag, Tooltip } from 'antd'
import { AddEditCategory } from '../AddEditCategory'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'

export const EditInventoryItem = ({
    isModalOpen,
    closeModal,
    item,
}: {
    isModalOpen: boolean
    closeModal: () => void
    item?: InventoryItem
}) => {
    const queryClient = useQueryClient()
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: categories } = useQuery(['allCategories'], getAllCategories)
    const { data: shop } = useQuery(['currentShop'], getShopData)
    const [showModal, setShowModal] = useState(false)

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
        reset,
        setValue,
    } = useForm<InventoryItem>({
        resolver: yupResolver(EditItemInventorySchema),
        defaultValues: item,
    })
    const models = brands?.find((b) => b.value === watch('brand'))?.models ?? []

    const onCreateCategory = (formValue: Category) => {
        return addCategory(formValue).then((category) => {
            setShowModal(false)
            queryClient.invalidateQueries(['brands']).then()
            queryClient.invalidateQueries(['allCategories']).then(() => setValue('categoryView', category))
        })
    }

    const submit = (formValue: InventoryItem) => {
        if (shop) {
            const item = {
                ...formValue,
                categoryId: formValue.categoryView?.id,
                shopId: shop.id,
                properties: formValue.columns,
            } as unknown as CreateInventoryItem
            toast
                .promise(putUpdateItem({ item }), toastUpdatePromiseTemplate('item'), toastProps)
                .then(() => {
                    closeModal()
                    queryClient.invalidateQueries(['shopItems']).then()
                })
                .catch((error: AppError) => {
                    setError('root', { message: error.detail })
                })
        } else {
            setError('root', { type: 'shopId', message: 'You are not assigned to any shop' })
        }
    }

    const category = watch('categoryView')

    useEffect(() => {
        if (item) reset(item)
    }, [item])
    useEffect(() => {
        const category = watch('categoryView')?.name
        const brand = watch('brand')
        const model = watch('model')
        setValue('name', `${category ?? ''} ${brand ?? ''} ${model ?? ''}`.trim())
    }, [watch('categoryView'), watch('brand'), watch('model')])

    return (
        <>
            <AddEditCategory
                closeModal={() => setShowModal(false)}
                isModalOpen={showModal}
                onComplete={onCreateCategory}
                category={{} as Category}
            />
            <AppModal {...{ isModalOpen, closeModal }} title={'Edit item #' + item?.id + ' in ' + shop?.shopName}>
                <form className='modalForm' onSubmit={handleSubmit(submit)}>
                    <Input
                        title='The name of the item'
                        value={watch('name')}
                        bordered={false}
                        disabled
                        placeholder={'Fill the form below to create the item name'}
                    />
                    <Space wrap className={'justify-between w-100'}>
                        <Controller
                            control={control}
                            name='categoryView'
                            render={({ field, fieldState }) => {
                                return (
                                    <FormField label={'Item Category'} error={fieldState.error}>
                                        <Space.Compact>
                                            <AppSelect<number, Category>
                                                options={categories}
                                                placeholder='Select Item Category'
                                                value={field.value?.id}
                                                onChange={(id) =>
                                                    field.onChange(
                                                        categories?.find((category) => category.id === id) ?? null
                                                    )
                                                }
                                                getOptionLabel={(category) => category.name}
                                                getOptionValue={(category) => category.id}
                                            />
                                            <Button
                                                onClick={() => {
                                                    setShowModal(true)
                                                }}
                                                icon={<FontAwesomeIcon icon={faPlus} />}
                                            >
                                                Add a new category
                                            </Button>
                                        </Space.Compact>
                                    </FormField>
                                )
                            }}
                        />
                        <Space wrap>
                            <Controller
                                control={control}
                                name={'brand'}
                                render={({ field, fieldState }) => (
                                    <FormField label='Brand' error={fieldState.error}>
                                        <AppCreatableSelect<ItemPropertyView>
                                            options={brands}
                                            placeholder='Select or add a new brand'
                                            value={field.value}
                                            onCreateOption={(item) => {
                                                setValue('model', '')
                                                field.onChange(item)
                                            }}
                                            onChange={(newValue) => {
                                                setValue('model', '')
                                                field.onChange(newValue)
                                            }}
                                            optionLabelProp={'value'}
                                            optionFilterProp={'value'}
                                        />
                                    </FormField>
                                )}
                            />
                            <Controller
                                control={control}
                                name={'model'}
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
                        </Space>
                    </Space>

                    <div>
                        <Space>
                            <TextField label='Count' register={register('count')} error={errors.count} type='number' />
                            {category?.itemType === 'DEVICE' && +watch('count') === 1 && (
                                <TextField
                                    label='Serial number / Imei'
                                    value={watch('imei')}
                                    register={register('imei')}
                                    error={errors.name}
                                    placeholder={'Serial number / Imei'}
                                />
                            )}
                        </Space>
                    </div>

                    <Space>
                        <TextField
                            label='Purchase Price'
                            register={register('purchasePrice')}
                            error={errors.purchasePrice}
                            type='currency'
                        />
                        <TextField
                            label='Sell Price'
                            register={register('sellPrice')}
                            error={errors.sellPrice}
                            type='currency'
                        />
                    </Space>
                    {category && category.columns.length > 0 && (
                        <Card title={category.name + ' properties'}>
                            {category.columns?.map((column, index) => (
                                <TextField
                                    button={
                                        column.showOnDocument && (
                                            <Tooltip
                                                title={`The ${column.name} will be visible on the printing label ${
                                                    column.showNameOnDocument && 'with the column name'
                                                }`}
                                            >
                                                <Tag icon={<FontAwesomeIcon icon={faEye} />} />
                                            </Tooltip>
                                        )
                                    }
                                    register={register(`columns.${column.name}`)}
                                    label={column.name}
                                    key={column.name + index}
                                />
                            ))}
                        </Card>
                    )}

                    <FormError error={errors.root?.message} />
                    <Space className={'flex-100 justify-end'}>
                        <Button type='primary' htmlType='submit'>
                            Update
                        </Button>
                        <Button htmlType='button' onClick={closeModal}>
                            Close
                        </Button>
                    </Space>
                </form>
            </AppModal>
        </>
    )
}
