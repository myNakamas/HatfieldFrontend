import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AddItemInventorySchema } from '../../models/validators/FormValidators';
import { CreateInventoryItem } from '../../models/interfaces/shop';
import { addNewItem, getAllBrands, getAllModels, getShopData } from '../../axios/http/shopRequests';
import { useQuery } from 'react-query';
import { TextField } from '../form/TextField';
import { FormError } from '../form/FormError';
import { AppModal } from './AppModal';
import React from 'react';
import Select from 'react-select';
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS';
import { ItemTypesArray } from '../../models/enums/shopEnums';
import CreatableSelect from 'react-select/creatable';
import { FormField } from '../form/Field';
import { ItemPropertyView } from '../../models/interfaces/generalModels';
import { toast } from 'react-toastify';

export const AddInventoryItem = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: shop } = useQuery('shop', getShopData)
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<CreateInventoryItem>({
        resolver: yupResolver(AddItemInventorySchema),
        defaultValues: { shopId: shop?.id },
    })
    const submit = (formValue: CreateInventoryItem) => {
        if (shop) {
            console.log('item: ', formValue)
            const item = { ...formValue, type: formValue.type.toUpperCase(), shopId: shop.id }
            const promise = addNewItem({ item })
                .then((value) => {
                    closeModal()
                })
                .catch((error) => {
                    setError('root', error)
                })
            toast.promise(promise, { pending: 'Sending', success: 'Done', error: 'Failed to create a new item' })
        } else {
            setError('root', { type: 'shopId', message: 'You are not assigned to any shop' })
        }
    }

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
                <Controller
                    control={control}
                    name='type'
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field'>
                                <div className='flex-100 justify-start textFormLabel'>Item type</div>
                                <Select
                                    theme={SelectTheme}
                                    name='type'
                                    options={ItemTypesArray}
                                    placeholder='Select Item Type'
                                    onChange={(type) => field.onChange(type?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => String(item.id)}
                                />
                                <FormError error={fieldState.error?.message} />
                            </div>
                        )
                    }}
                />
                <TextField label='Count' register={register('count')} error={errors.count} type='number' />
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
