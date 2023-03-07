import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AddItemInventorySchema } from '../../models/validators/FormValidators';
import { Category, CreateInventoryItem } from '../../models/interfaces/shop';
import { addNewItem, getAllBrands, getAllCategories, getAllModels, getShopData } from '../../axios/http/shopRequests';
import { useQuery, useQueryClient } from 'react-query';
import { TextField } from '../form/TextField';
import { FormError } from '../form/FormError';
import { AppModal } from './AppModal';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS';
import CreatableSelect from 'react-select/creatable';
import { FormField } from '../form/Field';
import { ItemPropertyView } from '../../models/interfaces/generalModels';
import { toast } from 'react-toastify';

export const AddInventoryItem = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const queryClient = useQueryClient()
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: categories } = useQuery('categories', getAllCategories)
    const { data: shop } = useQuery('shop', getShopData)
    const [columns, setColumns] = useState<string[]>()
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
    } = useForm<CreateInventoryItem>({
        resolver: yupResolver(AddItemInventorySchema),
        defaultValues: { shopId: shop?.id },
    })
    const submit = (formValue: CreateInventoryItem) => {
        if (shop) {
            const item = { ...formValue, shopId: shop.id }
            toast
                .promise(
                    addNewItem({ item })
                        .then((value) => {
                            closeModal()
                            queryClient.invalidateQueries('shopItem').then()
                        })
                        .catch((error) => {
                            setError('root', error)
                        }),
                    { pending: 'Sending', success: 'Done', error: 'Failed to create a new item' },
                    { position: 'top-right' }
                )
                .then()
        } else {
            setError('root', { type: 'shopId', message: 'You are not assigned to any shop' })
        }
    }
    useEffect(() => {
        const c = categories?.find((category) => category.id === watch('categoryId'))
        setColumns(c?.columns)
    }, [watch('categoryId')])

    return (
        <AppModal {...{ isModalOpen, closeModal }}>
            <h2>Add inventory item</h2>
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
                                value={field.value as unknown as ItemPropertyView}
                                onCreateOption={(item) => field.onChange({ value: item })}
                                onChange={(newValue) => field.onChange(newValue)}
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
                                value={field.value as unknown as ItemPropertyView}
                                onCreateOption={(item) => field.onChange({ value: item })}
                                onChange={(newValue) => field.onChange(newValue)}
                                getOptionLabel={(item) => item.value}
                                getOptionValue={(item) => item.id + item.value}
                            />
                        </FormField>
                    )}
                />
                <TextField label='Count' register={register('count')} error={errors.count} type='number' />

                <Controller
                    control={control}
                    name='categoryId'
                    render={({ field, fieldState }) => {
                        return (
                            <FormField label={'Item Category'} error={fieldState.error}>
                                <Select<Category>
                                    isClearable
                                    theme={SelectTheme}
                                    options={categories}
                                    placeholder='Select Item Category'
                                    onChange={(type) => {
                                        field.onChange(type?.id)
                                        setColumns(type?.columns)
                                    }}
                                    getOptionLabel={(item) => item.name}
                                    getOptionValue={(item) => String(item.id)}
                                />
                            </FormField>
                        )
                    }}
                />
                {columns &&
                    columns.map((key, index) => (
                        <TextField register={register(`properties.${key}`)} label={key} key={key + index} />
                    ))}

                <FormError error={errors.root?.message} />
                <div className='flex-100 justify-end'>
                    <button className='successButton' type='submit'>
                        Create
                    </button>
                    <button className='cancelButton' onClick={closeModal}>
                        Close
                    </button>
                </div>
            </form>
        </AppModal>
    )
}
