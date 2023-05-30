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
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import CreatableSelect from 'react-select/creatable'
import { FormField } from '../../form/Field'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { Button, Space } from 'antd'
import { AddEditCategory } from '../AddEditCategory'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

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

    useEffect(() => {
        if (item) reset(item)
    }, [item])
    useEffect(() => {
        const category = watch('categoryView')?.name
        const brand = watch('brand')
        const model = watch('model')
        setValue('name', `${category ?? ''} ${brand ?? ''} ${model ?? ''}`)
    }, [watch('categoryView'), watch('brand'), watch('model')])

    return (
        <>
            <AddEditCategory
                closeModal={() => setShowModal(false)}
                isModalOpen={showModal}
                onComplete={onCreateCategory}
                category={{} as Category}
            />
            <AppModal {...{ isModalOpen, closeModal }} title={'Edit item #' + item?.id}>
                <form className='modalForm' onSubmit={handleSubmit(submit)}>
                    <div className='textFormLabel'>Adding item to shop:</div>
                    <input readOnly className='input' disabled defaultValue={shop?.shopName} />
                    <TextField
                        label='Name'
                        value={watch('name')}
                        register={register('name')}
                        error={errors.name}
                        disabled
                        placeholder={'The name of the item'}
                    />
                    <Controller
                        control={control}
                        name='categoryView'
                        render={({ field, fieldState }) => {
                            return (
                                <FormField label={'Item Category'} error={fieldState.error}>
                                    <Space>
                                        <Select<Category>
                                            isClearable
                                            theme={SelectTheme}
                                            options={categories}
                                            placeholder='Select Item Category'
                                            value={categories?.find(({ id }) => field.value?.id === id) ?? null}
                                            onChange={(type) => {
                                                field.onChange(type)
                                            }}
                                            getOptionLabel={(item) => item.name}
                                            getOptionValue={(item) => String(item.id)}
                                        />
                                        <Button
                                            onClick={() => {
                                                setShowModal(true)
                                            }}
                                            icon={<FontAwesomeIcon icon={faPlus} />}
                                        >
                                            Add a new category
                                        </Button>
                                    </Space>
                                </FormField>
                            )
                        }}
                    />
                    <Controller
                        control={control}
                        name={'brand'}
                        render={({ field, fieldState }) => (
                            <FormField label='Brand' error={fieldState.error}>
                                <CreatableSelect<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles<ItemPropertyView>()}
                                    options={brands}
                                    formatCreateLabel={(value) => 'Create new brand ' + value}
                                    placeholder='Select or add a new brand'
                                    value={
                                        brands?.find((brand) => brand.value === field.value) ?? {
                                            id: -1,
                                            value: field.value,
                                        }
                                    }
                                    onCreateOption={(item) => field.onChange(item)}
                                    onChange={(newValue) => field.onChange(newValue?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => item.id + item.value}
                                />
                            </FormField>
                        )}
                    />
                    <Controller
                        control={control}
                        name={'model'}
                        render={({ field, fieldState }) => (
                            <FormField label='Model' error={fieldState.error}>
                                <CreatableSelect<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles<ItemPropertyView>()}
                                    options={models}
                                    placeholder='Select or add a new brand'
                                    formatCreateLabel={(value) => 'Create new model ' + value}
                                    value={
                                        models?.find((model) => model.value === field.value) ?? {
                                            id: -1,
                                            value: field.value,
                                        }
                                    }
                                    onCreateOption={(item) => field.onChange(item)}
                                    onChange={(newValue) => field.onChange(newValue?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => item.id + item.value}
                                />
                            </FormField>
                        )}
                    />
                    <TextField label='Count' register={register('count')} error={errors.count} type='number' />
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
                    <h2>Category specific properties:</h2>

                    {watch('categoryView') &&
                        watch('categoryView.columns').map((key, index) => (
                            <TextField register={register(`columns.${key}`)} label={key} key={key + index} />
                        ))}

                    <FormError error={errors.root?.message} />
                    <Space className={'flex-100 justify-end'}>
                        <Button type='primary' htmlType='submit'>
                            Create
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
