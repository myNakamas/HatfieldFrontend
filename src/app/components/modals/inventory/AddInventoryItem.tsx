import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { AddItemInventorySchema } from '../../../models/validators/FormValidators'
import { Category, CreateInventoryItem, Shop } from '../../../models/interfaces/shop'
import {
    addCategory,
    addNewItem,
    getAllBrands,
    getAllCategories,
    getAllShops,
    getShopData,
} from '../../../axios/http/shopRequests'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { AppModal } from '../AppModal'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FormField } from '../../form/Field'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { Button, Card, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { AddEditCategory } from '../AddEditCategory'
import { AuthContext } from '../../../contexts/AuthContext'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'

export const AddInventoryItem = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const { isWorker } = useContext(AuthContext)

    return (
        <AppModal {...{ isModalOpen, closeModal }} title={'Add inventory item'} isForbidden={!isWorker()}>
            <AddInventoryItemInner {...{ isModalOpen, closeModal }} />
        </AppModal>
    )
}

export const AddInventoryItemInner = ({
    isModalOpen,
    closeModal,
}: {
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const formRef = useRef<HTMLFormElement>(null)
    const { isAdmin } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const { data: brands } = useQuery('brands', getAllBrands, { suspense: true })
    const { data: categories } = useQuery(['allCategories'], getAllCategories, { suspense: true })
    const { data: shop } = useQuery(['currentShop'], getShopData, { suspense: true })
    const { data: shops } = useQuery('shops', getAllShops, { enabled: isAdmin(), suspense: true })

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

    const submit = (item: CreateInventoryItem) => {
        toast
            .promise(addNewItem({ item }), toastCreatePromiseTemplate('item'), toastProps)
            .then(() => {
                closeModal()
                formRef.current?.reset()
                queryClient.invalidateQueries(['shopItems']).then()
                queryClient.invalidateQueries(['brands']).then()
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }
    useEffect(() => {
        formRef.current?.reset()
        reset()
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
        <>
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
                <Space wrap className={'justify-between w-100'}>
                    <Controller
                        control={control}
                        name='categoryId'
                        render={({ field, fieldState }) => {
                            return (
                                <FormField label={'Item Category'} error={fieldState.error}>
                                    <Space.Compact>
                                        <AppSelect<number, Category>
                                            options={categories}
                                            placeholder='Select Item Category'
                                            value={field.value}
                                            onChange={(id) => field.onChange(id)}
                                            getOptionLabel={(category) => category.name}
                                            getOptionValue={(category) => category.id}
                                        />
                                        <Button
                                            onClick={() => {
                                                setShowCategoryModal(true)
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
                                        value={field.value?.value}
                                        onCreateOption={(item) => field.onChange({ value: item })}
                                        onChange={(newValue) => {
                                            resetField('model')
                                            field.onChange(brands?.find((brand) => brand.value === newValue) ?? null)
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
                                        value={field.value?.value}
                                        onCreateOption={(item) => field.onChange({ value: item })}
                                        onChange={(item) => field.onChange(item ? { value: item } : null)}
                                        optionLabelProp={'value'}
                                        optionFilterProp={'value'}
                                    />
                                </FormField>
                            )}
                        />
                    </Space>
                </Space>
                <Space wrap align={'start'} className={'w-100 justify-between'}>
                    <Space direction={'vertical'}>
                        <TextField label='Count' register={register('count')} error={errors.count} type='number' />
                        {isAdmin() && (
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <FormField label={'Shop to add the item to'}>
                                        <AppSelect<number, Shop>
                                            value={field.value}
                                            options={shops}
                                            placeholder='Assign to shop'
                                            onChange={(shopId) => field.onChange(shopId)}
                                            getOptionLabel={(shop) => shop.shopName}
                                            getOptionValue={(shop) => shop.id}
                                        />
                                    </FormField>
                                )}
                                name={'shopId'}
                            />
                        )}
                    </Space>
                    <Card title={'Pricing'}>
                        <Space wrap className={'w-100 justify-between'}>
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
                    </Card>
                </Space>
                {columns && (
                    <Card title={'Category specific properties'}>
                        {columns.map((key, index) => (
                            <TextField register={register(`properties.${key}`)} label={key} key={key + index} />
                        ))}
                    </Card>
                )}

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
        </>
    )
}
