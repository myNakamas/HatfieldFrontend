import { CreateUsedItem, Ticket } from '../../../models/interfaces/ticket'
import { AppModal } from '../AppModal'
import { Button, Form, Space } from 'antd'
import Select from 'react-select'
import { useQuery, useQueryClient } from 'react-query'
import { createUsedItems, fetchAllActiveTickets } from '../../../axios/http/ticketRequests'
import { CustomSuspense } from '../../CustomSuspense'
import { getAllShopItems } from '../../../axios/http/shopRequests'
import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { Controller, useForm } from 'react-hook-form'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { FormField } from '../../form/Field'
import { InventoryItem } from '../../../models/interfaces/shop'
import { TextField } from '../../form/TextField'
import { yupResolver } from '@hookform/resolvers/yup'
import { UsedItemSchema } from '../../../models/validators/FormValidators'
import { toastProps } from '../ToastProps'
import { toast } from 'react-toastify'

export const AddUsedItem = ({
    show,
    closeModal,
    usedItem,
}: {
    show: boolean
    closeModal: () => void
    usedItem: CreateUsedItem
}) => {
    const { loggedUser } = useContext(AuthContext)
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
                closeModal()
            })
    }

    return (
        <AppModal isModalOpen={show} closeModal={closeModal} title={'Use item for ticket'} size='S'>
            <Space direction='vertical' style={{ width: '100%' }}>
                <CustomSuspense isReady={!!tickets && !!items}>
                    <Form className='modalForm' onSubmitCapture={handleSubmit(createUsedItem)}>
                        <Controller
                            control={control}
                            name='ticketId'
                            render={({ field, fieldState }) => (
                                <FormField label={'Ticket'} error={fieldState.error}>
                                    <Select<Ticket, false>
                                        isClearable
                                        theme={SelectTheme}
                                        styles={SelectStyles<Ticket>()}
                                        options={tickets}
                                        placeholder='Choose a ticket'
                                        value={tickets?.find(({ id }) => field.value === id)}
                                        onChange={(newValue) => field.onChange(newValue?.id)}
                                        getOptionLabel={(item) =>
                                            ['Ticket#' + item.id, item.deviceBrand, item.deviceBrand].join(' ')
                                        }
                                        getOptionValue={(item) => item.id + ''}
                                    />
                                </FormField>
                            )}
                        />
                        <Controller
                            control={control}
                            name='itemId'
                            render={({ field, fieldState }) => (
                                <FormField label={'Item'} error={fieldState.error}>
                                    <Select<InventoryItem, false>
                                        isClearable
                                        theme={SelectTheme}
                                        styles={SelectStyles<InventoryItem>()}
                                        options={items}
                                        placeholder='Choose an item to use'
                                        value={items?.find(({ id }) => field.value === id)}
                                        onChange={(newValue) => field.onChange(newValue?.id)}
                                        getOptionLabel={(item) => [item.brand, item.model].join(' ')}
                                        getOptionValue={(item) => item.id + ''}
                                    />
                                </FormField>
                            )}
                        />
                        <TextField
                            register={register('count')}
                            error={errors.count}
                            type='number'
                            label='Number of items to use'
                        />
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
