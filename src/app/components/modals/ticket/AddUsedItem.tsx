import { CreateUsedItem, Ticket } from '../../../models/interfaces/ticket'
import { AppModal } from '../AppModal'
import { Button, Form, Space } from 'antd'
import { useQuery, useQueryClient } from 'react-query'
import { createUsedItems, fetchAllActiveTickets } from '../../../axios/http/ticketRequests'
import { CustomSuspense } from '../../CustomSuspense'
import { getAllShopItems } from '../../../axios/http/shopRequests'
import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { Controller, useForm } from 'react-hook-form'
import { FormField } from '../../form/Field'
import { InventoryItem } from '../../../models/interfaces/shop'
import { TextField } from '../../form/TextField'
import { yupResolver } from '@hookform/resolvers/yup'
import { UsedItemSchema } from '../../../models/validators/FormValidators'
import { toastProps } from '../ToastProps'
import { toast } from 'react-toastify'
import { FormError } from '../../form/FormError'
import { AppError } from '../../../models/interfaces/generalModels'
import { AppSelect } from '../../form/AppSelect'

export const AddUsedItem = ({
    show,
    closeModal,
    usedItem,
}: {
    show: boolean
    closeModal: () => void
    usedItem: CreateUsedItem
}) => {
    const { loggedUser, isWorker } = useContext(AuthContext)
    const { data: tickets } = useQuery(['tickets', 'active'], () => fetchAllActiveTickets({}))
    const { data: items } = useQuery(['shopItems', 'short', loggedUser?.shopId], () =>
        getAllShopItems(loggedUser?.shopId)
    )
    const {
        register,
        control,
        formState: { errors },
        handleSubmit,
        reset,
        setError,
        watch,
    } = useForm<CreateUsedItem>({ resolver: yupResolver(UsedItemSchema), defaultValues: usedItem })
    const queryClient = useQueryClient()
    useEffect(() => reset(usedItem), [show])

    const createUsedItem = (usedItem: CreateUsedItem) => {
        toast
            .promise(
                createUsedItems(usedItem),
                {
                    pending: 'Sending',
                    success: 'The selected item has successfully been used on the ticket!',
                    error: 'An error occurred',
                },
                toastProps
            )
            .then(async () => {
                await queryClient.invalidateQueries(['usedItems'])
                await queryClient.invalidateQueries(['tickets'])
                await queryClient.invalidateQueries(['shopItems', 'short'])
                closeModal()
            })
            .catch((error: AppError) => setError('root', { message: error.detail }))
    }

    return (
        <AppModal
            isModalOpen={show}
            closeModal={closeModal}
            title={'Use item for ticket'}
            size='S'
            isForbidden={!isWorker()}
        >
            <Space direction='vertical' style={{ width: '100%' }}>
                <CustomSuspense isReady={!!tickets && !!items}>
                    <Form className='modalForm' onSubmitCapture={handleSubmit(createUsedItem)}>
                        <Controller
                            control={control}
                            name='ticketId'
                            render={({ field, fieldState }) => (
                                <FormField label={'Ticket'} error={fieldState.error}>
                                    <AppSelect<number, Ticket>
                                        options={tickets}
                                        placeholder='Choose a ticket'
                                        value={field.value}
                                        onChange={field.onChange}
                                        getOptionLabel={(item) =>
                                            ['Ticket#' + item.id, item.deviceBrand, item.deviceBrand].join(' ')
                                        }
                                        getOptionValue={(item) => item.id}
                                    />
                                </FormField>
                            )}
                        />
                        <Controller
                            control={control}
                            name='itemId'
                            render={({ field, fieldState }) => (
                                <FormField label={'Item'} error={fieldState.error}>
                                    <AppSelect<number, InventoryItem>
                                        options={items}
                                        placeholder='Choose an item to use'
                                        value={field.value}
                                        onChange={field.onChange}
                                        getOptionLabel={(item) => item.name ?? ''}
                                        getOptionValue={(item) => item.id}
                                    />
                                </FormField>
                            )}
                        />
                        {watch('itemId') && (
                            <h4>
                                Current item count in the shop: {items?.find(({ id }) => watch('itemId') === id)?.count}
                            </h4>
                        )}
                        <TextField
                            register={register('count')}
                            error={errors.count}
                            type='number'
                            max={items?.find(({ id }) => watch('itemId') === id)?.count}
                            min={1}
                            label='Number of items to use'
                        />
                        <FormError error={errors.root?.message} />
                        <div className='flex-100 justify-end'>
                            <Button type='primary' htmlType='submit'>
                                Save
                            </Button>
                            <Button htmlType='button' onClick={closeModal}>
                                Close
                            </Button>
                        </div>
                    </Form>
                </CustomSuspense>
            </Space>
        </AppModal>
    )
}
