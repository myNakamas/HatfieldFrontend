import { InventoryItem } from '../../../models/interfaces/shop'
import { AppModal } from '../AppModal'
import { Button, Descriptions, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import React, { useEffect } from 'react'
import { TextField } from '../../form/TextField'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { EditRequiredItemSchema } from '../../../models/validators/FormValidators'
import { setRequiredItemCount } from '../../../axios/http/shopRequests'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { toast } from 'react-toastify'
import { useQueryClient } from 'react-query'

export const EditRequiredItem = ({
    inventoryItem,
    closeModal,
    openEditModal,
}: {
    inventoryItem?: InventoryItem
    closeModal: () => void
    openEditModal?: (item: InventoryItem) => void
}) => {
    const queryClient = useQueryClient()
    const {
        reset,
        watch,
        register,
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
                () => setRequiredItemCount({ id: formValue.id, count: formValue.requiredItem?.requiredAmount }),
                toastUpdatePromiseTemplate('required item count'),
                toastProps
            )
            .then(() => {
                queryClient.invalidateQueries(['shopItems', 'shoppingList']).then()
                closeModal()
            })
    }

    return (
        <AppModal
            isModalOpen={!!inventoryItem}
            closeModal={closeModal}
            title={`Adjust needed amount for inventory item '${inventoryItem?.name ?? inventoryItem?.id}'`}
        >
            {inventoryItem && (
                <form className='modalForm' onSubmit={handleSubmit(submitUpdate)}>
                    <Descriptions
                        size={'middle'}
                        layout={'vertical'}
                        column={3}
                        bordered
                        extra={
                            openEditModal && (
                                <Button
                                    onClick={() => {
                                        closeModal()
                                        openEditModal(inventoryItem)
                                    }}
                                    icon={<FontAwesomeIcon icon={faPen} />}
                                />
                            )
                        }
                    >
                        <Descriptions.Item label={'Model'}>{inventoryItem.model}</Descriptions.Item>
                        <Descriptions.Item label={'Brand'}>{inventoryItem.brand}</Descriptions.Item>
                        <Descriptions.Item label={'Current count in shop'}>{inventoryItem.count}</Descriptions.Item>
                        {inventoryItem.price && (
                            <Descriptions.Item label={'Price'} className='bold'>
                                {inventoryItem.price.toFixed(2)}
                            </Descriptions.Item>
                        )}
                        {inventoryItem.categoryView && (
                            <>
                                <Descriptions.Item label={'Type'}>
                                    {inventoryItem.categoryView.itemType}
                                </Descriptions.Item>
                                <Descriptions.Item label={'Category name'}>
                                    {inventoryItem.categoryView.name}
                                </Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                    <Descriptions layout={'vertical'} column={3} title={'Properties'} bordered>
                        {Object.entries(inventoryItem.columns).map(([name, value], index) => (
                            <Descriptions.Item key={name + index} label={name}>
                                {value}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                    <Space>
                        <TextField
                            register={register('requiredItem.requiredAmount')}
                            label={'Required count'}
                            type='number'
                            error={errors.count}
                        />
                        <h3>
                            Missing count: {Math.max(watch('requiredItem.requiredAmount') - inventoryItem.count, 0)}
                        </h3>
                    </Space>
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
