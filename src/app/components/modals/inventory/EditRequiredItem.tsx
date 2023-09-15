import { InventoryItem } from '../../../models/interfaces/shop'
import { AppModal } from '../AppModal'
import { Button, Collapse, Space, Switch } from 'antd'
import React, { useEffect } from 'react'
import { TextField } from '../../form/TextField'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { EditRequiredItemSchema } from '../../../models/validators/FormValidators'
import { updateRequiredItemCount } from '../../../axios/http/shopRequests'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { toast } from 'react-toastify'
import { useQueryClient } from 'react-query'
import { FormField } from '../../form/Field'
import FormItemLabel from 'antd/es/form/FormItemLabel'
import { ItemDescriptions } from './ViewInventoryItem'

export const EditRequiredItem = ({
    inventoryItem,
    closeModal,
}: {
    inventoryItem?: InventoryItem
    closeModal: () => void
}) => {
    const queryClient = useQueryClient()
    const {
        reset,
        watch,
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<InventoryItem>({
        resolver: yupResolver(EditRequiredItemSchema),
        defaultValues: inventoryItem,
    })
    useEffect(() => {
        if (inventoryItem) reset(inventoryItem)
    }, [inventoryItem])
    const submitUpdate = (formValue: InventoryItem) => {
        toast
            .promise(
                () =>
                    updateRequiredItemCount({
                        id: formValue.id,
                        count: formValue.requiredItem?.requiredAmount,
                        isNeeded: formValue.requiredItem?.isNeeded,
                    }),
                toastUpdatePromiseTemplate('required item count'),
                toastProps
            )
            .then(() => {
                queryClient.invalidateQueries(['shopItems']).then()
                closeModal()
            })
    }
    return (
        <AppModal
            isModalOpen={!!inventoryItem}
            closeModal={closeModal}
            title={`Adjust needed amount for inventory item '${inventoryItem?.name}'`}
        >
            {inventoryItem && (
                <form className='modalForm' onSubmit={handleSubmit(submitUpdate)}>
                    <Collapse
                        items={[
                            {
                                key: '1',
                                label: inventoryItem.name,
                                children: <ItemDescriptions inventoryItem={inventoryItem} />,
                            },
                        ]}
                    />
                    <Space className={'w-100 '}>
                        <TextField
                            register={register('requiredItem.requiredAmount')}
                            label={'Required count for the shop'}
                            type='number'
                            error={errors.requiredItem?.requiredAmount}
                        />
                        <FormField label={'Current count in  store'}>
                            <input className={'input'} disabled readOnly value={inventoryItem.count + ''} />
                        </FormField>
                        <FormField label={'Missing'}>
                            <input
                                className={'input'}
                                readOnly
                                disabled
                                value={Math.max(watch('requiredItem.requiredAmount') - inventoryItem.count, 0) + ''}
                            />
                        </FormField>
                    </Space>
                    <Controller
                        control={control}
                        name={'requiredItem.isNeeded'}
                        render={({ field: { value, onChange } }) => {
                            return (
                                <Space>
                                    <FormItemLabel prefixCls={''} label={'Does the shop require this item'} />
                                    <Switch checked={value} onChange={() => onChange(!value)} />
                                </Space>
                            )
                        }}
                    />
                    <Space className={'flex-100 justify-end'}>
                        <Button type='primary' htmlType='submit'>
                            Save
                        </Button>
                        <Button htmlType='button' onClick={closeModal}>
                            Close
                        </Button>
                    </Space>
                </form>
            )}
        </AppModal>
    )
}
