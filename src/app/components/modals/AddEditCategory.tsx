import { Controller, FieldError, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CategorySchema } from '../../models/validators/FormValidators'
import { Category } from '../../models/interfaces/shop'
import { TextField } from '../form/TextField'
import { AppModal } from './AppModal'
import React, { useEffect, useRef } from 'react'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { ItemTypesArray } from '../../models/enums/shopEnums'
import { FormField } from '../form/Field'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { Button, Typography } from 'antd'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

export const AddEditCategory = ({
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
    const formRef = useRef<HTMLFormElement>(null)
    const defaultValue = { ...category, columns: category?.columns ?? [] }
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset,
    } = useForm<Category>({
        resolver: yupResolver(CategorySchema),
        defaultValues: defaultValue,
    })
    const properties = watch('columns') ?? []
    useEffect(() => {
        formRef.current?.reset()
        reset(defaultValue)
    }, [isModalOpen])

    const displayProperties = (value: string, index: number) => {
        const error = errors.columns && (errors.columns[index] as FieldError)
        return (
            <TextField
                key={index}
                register={register(`columns.${index}`)}
                error={error}
                label={`Column ${index + 1}`}
                button={
                    <Button
                        onClick={() =>
                            setValue(
                                'columns',
                                getValues('columns').filter((value, i) => i !== index)
                            )
                        }
                        icon={<FontAwesomeIcon color='red' icon={faTrash} />}
                    />
                }
            />
        )
    }

    return (
        <AppModal {...{ isModalOpen, closeModal }} title={'Category'}>
            {category && (
                <form ref={formRef} className='modalForm' onSubmit={handleSubmit(onComplete)}>
                    <TextField register={register('name')} error={errors.name} label={'Category name'} />
                    <Controller
                        control={control}
                        render={({ field, fieldState }) => (
                            <FormField label={'Item type'} error={fieldState.error}>
                                <Select<ItemPropertyView>
                                    theme={SelectTheme}
                                    styles={SelectStyles()}
                                    name='type'
                                    value={ItemTypesArray.find(({ value }) => value === field.value) ?? null}
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
                    <Typography>Properties</Typography>
                    <Button
                        onClick={() => setValue('columns', [...getValues('columns'), ''])}
                        icon={<FontAwesomeIcon size='lg' icon={faPlus} />}
                    />
                    {properties && properties.length ? (
                        properties?.map((value, index) => displayProperties(value, index))
                    ) : (
                        <></>
                    )}
                    <div className='flex-100 justify-end'>
                        <Button type='primary' htmlType='submit'>
                            Save
                        </Button>
                        <Button htmlType='button' onClick={closeModal}>
                            Close
                        </Button>
                    </div>
                </form>
            )}
        </AppModal>
    )
}
