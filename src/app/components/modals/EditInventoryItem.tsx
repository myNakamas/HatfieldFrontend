import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { EditItemInventorySchema } from '../../models/validators/FormValidators'
import { Category, InventoryItem } from '../../models/interfaces/shop'
import {
    addCategory,
    getAllBrands,
    getAllCategories,
    getAllModels,
    getShopData,
    putUpdateItem,
} from '../../axios/http/shopRequests'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../form/TextField'
import { FormError } from '../form/FormError'
import { AppModal } from './AppModal'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import CreatableSelect from 'react-select/creatable'
import { FormField } from '../form/Field'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { toast } from 'react-toastify'
import { toastProps } from './ToastProps'
import { Button, Space } from 'antd'
import { AddInventoryCategory } from './AddEditCategory'
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
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: categories } = useQuery(['allCategories'], getAllCategories)
    const { data: shop } = useQuery(['currentShop'], getShopData)
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
        reset,
    } = useForm<InventoryItem>({
        resolver: yupResolver(EditItemInventorySchema),
        defaultValues: item,
    })
    const submit = (formValue: InventoryItem) => {
        if (shop) {
            const item = { ...formValue, categoryId: formValue.categoryView.id, shopId: shop.id }
            toast
                .promise(
                    putUpdateItem({ item })
                        .then(() => {
                            closeModal()
                            queryClient.invalidateQueries(['shopItems']).then()
                        })
                        .catch((error) => {
                            setError('root', error)
                        }),
                    { pending: 'Sending', success: 'Done', error: 'Failed to create a new item' },
                    toastProps
                )
                .then()
        } else {
            setError('root', { type: 'shopId', message: 'You are not assigned to any shop' })
        }
    }

    useEffect(() => {
        if (item) reset(item)
    }, [item])

    return (
        <AppModal {...{ isModalOpen, closeModal }} title={'Edit item #' + item?.id}>
            <form className='modalForm' onSubmit={handleSubmit(submit)}>
                <div className='textFormLabel'>Adding item to shop:</div>
                <input readOnly className='input' disabled defaultValue={shop?.shopName} />
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
                                    brands?.find((brand) => brand.value === field.value) || {
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
                                    models?.find((model) => model.value === field.value) || {
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
                                        onChange={(type) => {
                                            field.onChange(type)
                                        }}
                                        getOptionLabel={(item) => item.name}
                                        getOptionValue={(item) => String(item.id)}
                                    />
                                    <InlineAddInventoryCategory />
                                </Space>
                            </FormField>
                        )
                    }}
                />
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
    )
}

const InlineAddInventoryCategory = () => {
    const [showModal, setShowModal] = useState(false)
    const queryClient = useQueryClient()

    const onCreate = (formValue: Category) => {
        return addCategory(formValue).then(() => {
            setShowModal(false)
            queryClient.invalidateQueries(['allCategories']).then()
        })
    }

    return (
        <>
            <AddInventoryCategory
                closeModal={() => setShowModal(false)}
                isModalOpen={showModal}
                onComplete={onCreate}
                category={{} as Category}
            />
            <Button
                onClick={() => {
                    setShowModal(true)
                }}
                icon={<FontAwesomeIcon icon={faPlus} />}
            >
                Add a new category
            </Button>
        </>
    )
}
