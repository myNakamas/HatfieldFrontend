import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { AddItemInventorySchema } from '../../../models/validators/FormValidators'
import { Category, CreateInventoryItem } from '../../../models/interfaces/shop'
import { addCategory, addNewItem, getAllBrands, getAllCategories, getShopData } from '../../../axios/http/shopRequests'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { AppModal } from '../AppModal'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import CreatableSelect from 'react-select/creatable'
import { FormField } from '../../form/Field'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { Button, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AddEditCategory } from '../AddEditCategory'
import { AuthContext } from '../../../contexts/AuthContext'

export const AddInventoryItem = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const formRef = useRef<HTMLFormElement>(null)
    const { isWorker } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: categories } = useQuery(['allCategories'], getAllCategories)
    const { data: shop } = useQuery(['currentShop'], getShopData)
    const [columns, setColumns] = useState<string[]>()
    const [showCategoryModal, setShowCategoryModal] = useState(false)

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
        setValue,
        reset,
        resetField,
    } = useForm<CreateInventoryItem>({
        resolver: yupResolver(AddItemInventorySchema),
        defaultValues: { shopId: shop?.id },
    })
    const models = watch('brand')?.models ?? []

    const onCreateCategory = (formValue: Category) => {
        return addCategory(formValue).then((category) => {
            setShowCategoryModal(false)
            queryClient.invalidateQueries(['allCategories']).then(() => setValue('categoryId', category.id))
        })
    }

    const submit = (formValue: CreateInventoryItem) => {
        if (shop) {
            const item = { ...formValue, shopId: shop.id }
            toast
                .promise(addNewItem({ item }), toastCreatePromiseTemplate('item'), toastProps)
                .then(() => {
                    closeModal()
                    reset({})
                    queryClient.invalidateQueries(['shopItems']).then()
                    queryClient.invalidateQueries(['brands']).then()
                })
                .catch((error) => {
                    setError('root', error)
                })
        } else {
            setError('root', { type: 'shopId', message: 'You are not assigned to any shop' })
        }
    }
    useEffect(() => {
        formRef.current?.reset()
    }, [isModalOpen])
    useEffect(() => {
        const c = categories?.find((category) => category.id === watch('categoryId'))
        setColumns(c?.columns)
    }, [watch('categoryId')])

    useEffect(() => {
        const category = categories?.find((category) => category.id === watch('categoryId'))
        const brand = watch('brand')?.value
        const model = watch('model')?.value
        setValue('name', `${category?.name ?? ''} ${brand ?? ''} ${model ?? ''}`)
    }, [watch('categoryId'), watch('brand'), watch('model')])

    return (
        <AppModal {...{ isModalOpen, closeModal }} title={'Add inventory item'} isForbidden={!isWorker()}>
            <AddEditCategory
                closeModal={() => setShowCategoryModal(false)}
                isModalOpen={showCategoryModal}
                onComplete={onCreateCategory}
                category={{} as Category}
            />
            <form className='modalForm' onSubmit={handleSubmit(submit)} ref={formRef}>
                <div className='textFormLabel'>Adding item to shop:</div>
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
                    name='categoryId'
                    render={({ field, fieldState }) => {
                        return (
                            <FormField label={'Item Category'} error={fieldState.error}>
                                <Space>
                                    <Select<Category>
                                        isClearable
                                        theme={SelectTheme}
                                        options={categories}
                                        placeholder='Select Item Category'
                                        value={categories?.find(({ id }) => field.value === id) ?? null}
                                        onChange={(type) => {
                                            field.onChange(type?.id)
                                            setColumns(type?.columns)
                                        }}
                                        getOptionLabel={(item) => item.name}
                                        getOptionValue={(item) => String(item.id)}
                                    />
                                    <Button
                                        onClick={() => {
                                            setShowCategoryModal(true)
                                        }}
                                        icon={<FontAwesomeIcon icon={faPlus} />}
                                    >
                                        Add a new category
                                    </Button>{' '}
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
                                value={field.value as unknown as ItemPropertyView}
                                onCreateOption={(item) => field.onChange({ value: item })}
                                onChange={(newValue) => {
                                    resetField('model')
                                    field.onChange(newValue)
                                }}
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
                                placeholder='Select or add a new model'
                                noOptionsMessage={() =>
                                    watch('brand') ? 'No models available' : 'Please select a brand'
                                }
                                formatCreateLabel={(value) => `Create new model '${value}'`}
                                value={field.value ?? null}
                                onCreateOption={(item) => field.onChange({ value: item })}
                                onChange={(newValue) => field.onChange(newValue)}
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
                {columns &&
                    columns.map((key, index) => (
                        <TextField register={register(`properties.${key}`)} label={key} key={key + index} />
                    ))}
                <input readOnly className='input' disabled defaultValue={shop?.shopName} />

                <FormError error={errors.root?.message} />
                <div className='flex-100 justify-end'>
                    <Button type='primary' htmlType='submit'>
                        Save
                    </Button>
                    <Button htmlType='button' onClick={closeModal}>
                        Close
                    </Button>
                </div>
            </form>
        </AppModal>
    )
}
