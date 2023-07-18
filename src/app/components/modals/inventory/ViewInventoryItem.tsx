import { InventoryItem, TransferItem } from '../../../models/interfaces/shop'
import { AppModal } from '../AppModal'
import { Button, Card, Collapse, Descriptions, Divider, Input, Space, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoltLightning, faFileCircleExclamation, faPen } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useState } from 'react'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'
import { postPrintItemLabel } from '../../../axios/http/documentRequests'
import { AddUsedItem } from '../ticket/AddUsedItem'
import { CreateUsedItem } from '../../../models/interfaces/ticket'
import { Controller, useForm } from 'react-hook-form'
import { TextField } from '../../form/TextField'
import { yupResolver } from '@hookform/resolvers/yup'
import { SendItemToShopSchema, UpdateItemCountSchema } from '../../../models/validators/FormValidators'
import {
    getWorkerShops,
    postMarkItemAsDamaged,
    postMarkItemAsDefective,
    sendToShop,
    updateItemQuantity,
} from '../../../axios/http/shopRequests'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { useQuery, useQueryClient } from 'react-query'
import { AddInvoice } from '../AddInvoice'
import { FormField } from '../../form/Field'
import Select from 'react-select'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import CollapsePanel from 'antd/es/collapse/CollapsePanel'
import { AuthContext } from '../../../contexts/AuthContext'

export const ViewInventoryItem = ({
    inventoryItem,
    closeModal,
    openEditModal,
}: {
    inventoryItem?: InventoryItem
    closeModal: () => void
    openEditModal?: (item: InventoryItem) => void
}) => {
    const [sellModalOpen, setSellModalOpen] = useState(false)
    const [isUseModalOpen, setIsUseModalOpen] = useState(false)
    const queryClient = useQueryClient()
    const printSellDocument = async () => {
        const blob = await postPrintItemLabel(inventoryItem?.id)
        if (blob) {
            const fileUrl = URL.createObjectURL(blob)
            window.open(fileUrl)
        }
    }

    const markItemAsDamaged = (id: number) => {
        toast
            .promise(postMarkItemAsDamaged({ itemId: id }), toastUpdatePromiseTemplate('item'), toastProps)
            .then(() => {
                queryClient.invalidateQueries(['shopItems']).then()
            })
    }

    const markItemAsDefective = (id: number) => {
        toast
            .promise(postMarkItemAsDefective({ itemId: id }), toastUpdatePromiseTemplate('item'), toastProps)
            .then(() => {
                queryClient.invalidateQueries(['shopItems']).then()
            })
    }

    return (
        <AppModal
            isModalOpen={!!inventoryItem}
            closeModal={closeModal}
            title={'Inventory Item ' + inventoryItem?.name ?? ''}
        >
            <AddUsedItem
                usedItem={{ itemId: inventoryItem?.id, count: 1, ticketId: undefined } as unknown as CreateUsedItem}
                closeModal={() => setIsUseModalOpen(false)}
                show={isUseModalOpen}
            />
            {inventoryItem && (
                <AddInvoice
                    item={inventoryItem}
                    closeModal={() => setSellModalOpen(false)}
                    isModalOpen={sellModalOpen}
                />
            )}
            {inventoryItem && (
                <Space direction='vertical' style={{ width: '100%' }}>
                    {openEditModal && (
                        <Button
                            className={'editModalButton'}
                            onClick={() => {
                                closeModal()
                                openEditModal(inventoryItem)
                            }}
                            icon={<FontAwesomeIcon icon={faPen} />}
                        />
                    )}
                    <ItemDescriptions inventoryItem={inventoryItem} />
                    <Divider />

                    <Space wrap align={'start'} className={'justify-between w-100'}>
                        <Card title={'Actions'}>
                            <Space direction={'vertical'}>
                                <Space>
                                    <Typography>Print the label for the item</Typography>
                                    <Button onClick={printSellDocument} icon={<FontAwesomeIcon icon={faPrint} />}>
                                        Print
                                    </Button>
                                </Space>
                                <Space>
                                    <Typography>Sell as an item</Typography>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faShoppingCart} />}
                                        onClick={() => setSellModalOpen(true)}
                                    >
                                        Sell
                                    </Button>
                                </Space>
                                <Space>
                                    <Typography>Use in a ticket</Typography>
                                    <Button onClick={() => setIsUseModalOpen(true)} type={'primary'}>
                                        Add to ticket
                                    </Button>
                                </Space>
                            </Space>
                        </Card>
                        <Card size={'small'} title={'Modify item quantity'}>
                            <Space direction={'vertical'}>
                                <Space>
                                    <Typography>Mark one as damaged</Typography>
                                    <Button
                                        onClick={() => markItemAsDamaged(inventoryItem.id)}
                                        icon={<FontAwesomeIcon icon={faBoltLightning} />}
                                    />
                                </Space>
                                <Space>
                                    <Typography>Mark one as defective</Typography>
                                    <Button
                                        onClick={() => markItemAsDefective(inventoryItem.id)}
                                        icon={<FontAwesomeIcon icon={faFileCircleExclamation} />}
                                    />
                                </Space>
                                <UpdateItemCountForm item={inventoryItem} />

                                <Space>
                                    <SendItemToShop item={inventoryItem} />
                                </Space>
                            </Space>
                        </Card>
                    </Space>
                </Space>
            )}
        </AppModal>
    )
}

export const ItemDescriptions = ({
    inventoryItem,
    showCount,
}: {
    inventoryItem: InventoryItem
    showCount?: boolean
}) => {
    return (
        <Space direction={'vertical'} className={'w-100'}>
            <Space wrap align={'start'} className={'justify-between w-100'}>
                <Card
                    size={'small'}
                    title={'Device brand & model'}
                    children={`${inventoryItem.brand ?? ''}  ${inventoryItem.model ?? ''}`}
                />
                {showCount && (
                    <Card size={'small'} title={'Current count in shop'}>
                        {inventoryItem.count}
                    </Card>
                )}
                {inventoryItem?.categoryView && (
                    <Space wrap>
                        <Card size={'small'} title={'Type'}>
                            {inventoryItem.categoryView.itemType}
                        </Card>
                        <Card size={'small'} title={'Category'}>
                            {inventoryItem.categoryView.name}
                        </Card>
                    </Space>
                )}
            </Space>
            <div className={'justify-around align-start flex-100 flex-wrap'}>
                <Card title={'Pricing'} style={{ flex: 1 }}>
                    {inventoryItem?.sellPrice && (
                        <>
                            <div className='bold'>Selling Price: {inventoryItem.sellPrice.toFixed(2)}</div>
                            <Divider />
                        </>
                    )}
                    {inventoryItem?.purchasePrice && (
                        <div className='bold'>Purchased for: {inventoryItem.purchasePrice.toFixed(2)}</div>
                    )}
                </Card>
                <Space wrap className={'w-100 justify-around'} style={{ flex: 3 }} align={'start'}>
                    <Card title={'Properties'}>
                        <Descriptions layout={'horizontal'} style={{ flex: 1, width: '100%' }}>
                            {Object.entries(inventoryItem.columns).map(([name, value], index) => (
                                <Descriptions.Item key={name + index} label={name}>
                                    {value}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    </Card>
                </Space>
            </div>
        </Space>
    )
}

const UpdateItemCountForm = ({ item, onComplete }: { item: InventoryItem; onComplete?: () => void }) => {
    const queryClient = useQueryClient()

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<InventoryItem>({ defaultValues: item, resolver: yupResolver(UpdateItemCountSchema) })
    const updateCount = (value: InventoryItem) => {
        toast
            .promise(updateItemQuantity({ item: value }), toastUpdatePromiseTemplate('item count'), toastProps)
            .then(() => queryClient.invalidateQueries(['shopItems']).then(onComplete))
    }
    useEffect(() => {
        reset(item)
    }, [item])

    return (
        <form onSubmit={handleSubmit(updateCount)} className={'modalForm'}>
            <FormField label={'Current count in shop'} error={errors.count}>
                <Controller
                    control={control}
                    render={({ field }) => (
                        <Space.Compact>
                            <Input
                                min={0}
                                defaultValue={item.count}
                                inputMode={'numeric'}
                                value={field.value}
                                onChange={field.onChange}
                                status={errors.count ? 'error' : ''}
                                type='number'
                            />
                            <Button type={'primary'} htmlType={'submit'}>
                                Update
                            </Button>
                        </Space.Compact>
                    )}
                    name={'count'}
                />
            </FormField>
        </form>
    )
}

const SendItemToShop = ({ item }: { item: InventoryItem }) => {
    const { data: shops } = useQuery('shops', getWorkerShops)
    const { loggedUser } = useContext(AuthContext)
    const {
        formState: { errors },
        control,
        register,
        handleSubmit,
        setError,
        reset,
    } = useForm<TransferItem>({
        resolver: yupResolver(SendItemToShopSchema),
    })
    const queryClient = useQueryClient()
    const submit = (formValue: TransferItem) => {
        const itemInfo = { ...formValue, itemId: item.id }
        toast
            .promise(sendToShop({ item: itemInfo }), toastUpdatePromiseTemplate('item'), toastProps)
            .then(() => {
                queryClient.invalidateQueries(['shopItems']).then()
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }

    useEffect(() => {
        reset()
    }, [item])

    return (
        <form onSubmit={handleSubmit(submit)} className={'modalForm'}>
            <Collapse>
                <CollapsePanel key={'1'} header={'Send to another shop'}>
                    <Controller
                        control={control}
                        name={'shopId'}
                        render={({ field: { value, onChange }, fieldState }) => (
                            <FormField label='Shop' error={fieldState.error}>
                                <Select<ItemPropertyView, false>
                                    isClearable
                                    theme={SelectTheme}
                                    styles={SelectStyles()}
                                    options={shops?.filter((shop) => shop.id !== loggedUser?.shopId)}
                                    placeholder='Shop'
                                    value={shops?.find(({ id }) => value === id) ?? null}
                                    onChange={(value) => onChange(value?.id)}
                                    getOptionLabel={(shops) => shops.value}
                                    getOptionValue={(shops) => String(shops.id)}
                                />
                            </FormField>
                        )}
                    />
                    <TextField
                        min={0}
                        defaultValue={item.count}
                        register={register('count')}
                        error={errors.count}
                        type='number'
                    />
                    <Button htmlType={'submit'}>Send</Button>
                </CollapsePanel>
            </Collapse>
        </form>
    )
}
