import { Controller, FieldError, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CategorySchema } from '../../models/validators/FormValidators';
import { Category } from '../../models/interfaces/shop';
import { TextField } from '../form/TextField';
import { AppModal } from './AppModal';
import React from 'react';
import Select from 'react-select';
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS';
import { ItemTypesArray } from '../../models/enums/shopEnums';
import { FormField } from '../form/Field';
import { ItemPropertyView } from '../../models/interfaces/generalModels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';

export const AddInventoryCategory = ({
    isModalOpen,
    closeModal,
    category,
    onComplete,
}: {
    isModalOpen: boolean
    closeModal: () => void
    category?: Category
    onComplete: (formValue: Category) => Promise<void>
}) => {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
    } = useForm<Category>({
        resolver: yupResolver(CategorySchema),
        defaultValues: { ...category, columns: category?.columns ?? [] },
    })
    const properties = watch('columns') ?? []

    const displayProperties = (value: string, index: number) => {
        const error = errors.columns && (errors.columns[index] as FieldError)
        return (
            <TextField
                key={index}
                register={register(`columns.${index}`)}
                error={error}
                label={`Column ${index + 1}`}
                button={
                    <div
                        className='icon-s clickable'
                        onClick={() =>
                            setValue(
                                'columns',
                                getValues('columns').filter((value, i) => i !== index)
                            )
                        }
                    >
                        <FontAwesomeIcon color='red' icon={faTrash} />
                    </div>
                }
            />
        )
    }

    return (
        <AppModal {...{ isModalOpen, closeModal }}>
            <h2>Category</h2>
            {category && (
                <form className='modalForm' onSubmit={handleSubmit(onComplete)}>
                    <TextField register={register('name')} error={errors.name} label={'Category name'} />
                    <Controller
                        control={control}
                        render={({ field, fieldState }) => (
                            <FormField label={'Item type'} error={fieldState.error}>
                                <Select<ItemPropertyView>
                                    theme={SelectTheme}
                                    styles={SelectStyles()}
                                    name='type'
                                    options={ItemTypesArray}
                                    placeholder='Select Item Type'
                                    onChange={(type) => field.onChange(type?.value)}
                                    getOptionLabel={(item) => item.value}
                                    getOptionValue={(item) => String(item.id)}
                                />
                            </FormField>
                        )}
                        name={'itemType'}
                    />
                    <label>
                        Properties{' '}
                        <FontAwesomeIcon
                            size='lg'
                            color='green'
                            className=' clickable'
                            icon={faPlusCircle}
                            onClick={() => setValue('columns', [...getValues('columns'), ''])}
                        />
                    </label>
                    {   properties?.map((value, index) => displayProperties(value, index))}
                    <div className='flex-100 justify-end'>
                        <button className='successButton' type='submit'>
                            Save
                        </button>
                        <button className='cancelButton' onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </form>
            )}
        </AppModal>
    )
}
