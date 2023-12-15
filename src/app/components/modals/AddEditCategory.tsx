import { Controller, FieldError, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CategorySchema } from '../../models/validators/FormValidators'
import { Category, CategoryColumn } from '../../models/interfaces/shop'
import { TextField } from '../form/TextField'
import { AppModal } from './AppModal'
import React, { useContext, useEffect, useRef } from 'react'
import { ItemTypesArray } from '../../models/enums/shopEnums'
import { FormField } from '../form/Field'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { Button, Checkbox, Divider, Empty, List, Space, Tag, Tooltip, Typography } from 'antd'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { AuthContext } from '../../contexts/AuthContext'
import { AppSelect } from '../form/AppSelect'
import { NoDataComponent } from '../table/NoDataComponent'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

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
    const { isWorker } = useContext(AuthContext)
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
    const maxColumns = watch('itemType')=='DEVICE'? 4 : 5;

    useEffect(() => {
        formRef.current?.reset()
        reset(defaultValue)
    }, [isModalOpen])

    const displayProperties = (column: CategoryColumn, index: number) => {
        const error = errors.columns && (errors.columns[index] as FieldError)
        return (
            <div key={index}>
                <Space wrap className='w-100 justify-between'>
                    <TextField
                        placeholder='Column name'
                        register={register(`columns.${index}.name`)}
                        error={error}
                        autoFocus
                    />
                    <Space direction='vertical'>
                        <Tooltip destroyTooltipOnHide title='Whether this property will be printed or not.'>
                            <Checkbox
                                checked={column.showOnDocument ?? false}
                                onChange={(e) => setValue(`columns.${index}.showOnDocument`, e.target.checked)}
                            >
                                Show on label
                            </Checkbox>
                        </Tooltip>
                        <Tooltip destroyTooltipOnHide title={`To display the name of the column before the value on the label or not.`}>
                            <Checkbox
                                checked={column.showNameOnDocument ?? false}
                                onChange={(e) => setValue(`columns.${index}.showNameOnDocument`, e.target.checked)}
                            >
                                Show column name on label
                            </Checkbox>
                        </Tooltip>
                    </Space>

                    <Button
                        onClick={() =>
                            setValue(
                                'columns',
                                getValues('columns').filter((_, i) => i !== index)
                            )
                        }
                        title='Delete this column'
                        icon={<FontAwesomeIcon color='red' icon={faTrash} />}
                    />
                </Space>
                <Divider style={{ marginTop: 12, marginBottom: 12 }} />
            </div>
        )
    }

    return (
        <AppModal {...{ isModalOpen, closeModal }} title={'Category'} isForbidden={!isWorker()}>
            {category && (
                <form ref={formRef} className='modalForm' onSubmit={handleSubmit(onComplete)}>
                    <Divider />
                    <div className='flex-100 justify-between flex-wrap flex-gap align-start'>
                        <Space direction='vertical'>
                            <TextField register={register('name')} error={errors.name} label={'Category name'} />
                            <Controller
                                control={control}
                                render={({ field, fieldState }) => (
                                    <FormField label={'Item type'} error={fieldState.error}>
                                        <AppSelect<string, ItemPropertyView>
                                            value={field.value}
                                            options={ItemTypesArray}
                                            placeholder='Select Item Type'
                                            onChange={(type) => field.onChange(type)}
                                            getOptionLabel={(item) => item.value}
                                            getOptionValue={(item) => item.value}
                                        />
                                    </FormField>
                                )}
                                name={'itemType'}
                            />
                        </Space>
                        <List
                            className='properties'
                            header={
                                <Space className='w-100 justify-between'>
                                    <div>Category Properties</div>
                                    <Button
                                        onClick={() => {
                                            setValue('columns', [...getValues('columns'), { name: '' }])
                                        }}
                                        icon={<FontAwesomeIcon size='lg' icon={faPlus} />}
                                    >
                                        {' '}
                                        Add a new proeprty
                                    </Button>
                                </Space>
                            }
                            dataSource={properties}
                            renderItem={displayProperties}
                            footer={
                                properties.filter((column) => column.showOnDocument).length > maxColumns && (
                                    <Tag color='gold' icon={<FontAwesomeIcon icon={faExclamationTriangle} />}>
                                        The printable label might not have enough space for all selected properties.
                                        <br /> Please pick <b>{maxColumns} properties or less.</b>
                                    </Tag>
                                )
                            }
                        ></List>
                    </div>

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
