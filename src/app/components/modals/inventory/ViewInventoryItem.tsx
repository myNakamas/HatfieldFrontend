import { InventoryItem, TransferItem } from '../../../models/interfaces/shop'
import { AppModal } from '../AppModal'
import { Button, Card, Collapse, Descriptions, Divider, Input, Space, Tag, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBoltLightning,
    faCashRegister,
    faCircleDollarToSlot,
    faEye,
    faFileCircleExclamation,
    faFunnelDollar,
    faPen,
} from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useState } from 'react'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'
import { getPrintItemLabel, postPrintItemLabel } from '../../../axios/http/documentRequests'
import { AddUsedItem } from '../ticket/AddUsedItem'
import { CreateUsedItem } from '../../../models/interfaces/ticket'
import { Controller, useForm } from 'react-hook-form'
import { TextField } from '../../form/TextField'
import { yupResolver } from '@hookform/resolvers/yup'
import { SendItemToShopSchema, UpdateItemCountSchema } from '../../../models/validators/FormValidators'
import {
    getShopData,
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
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { AuthContext } from '../../../contexts/AuthContext'
import { AppSelect } from '../../form/AppSelect'
import { openPdfBlob } from '../../../pages/invoices/Invoices'
import { currencyFormat } from '../../../utils/helperFunctions'

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
    const { data: shop } = useQuery(['currentShop'], getShopData)
    const queryClient = useQueryClient()

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
            title={`Item #${inventoryItem?.id} ${inventoryItem?.name}` ?? ''}
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
                                    <Button.Group>
                                        <Button
                                            title={
                                                !shop?.shopSettingsView.printEnabled
                                                    ? 'Printing is disabled for this shop'
                                                    : 'Print'
                                            }
                                            disabled={!shop?.shopSettingsView.printEnabled}
                                            onClick={() => printItemLabel(inventoryItem)}
                                            icon={<FontAwesomeIcon icon={faPrint} />}
                                        >
                                            Print
                                        </Button>
                                        <Button
                                            title={
                                                !shop?.shopSettingsView.printEnabled
                                                    ? 'Printing is disabled for this shop'
                                                    : 'Preview label'
                                            }
                                            disabled={!shop?.shopSettingsView.printEnabled}
                                            onClick={() => previewItemLabel(inventoryItem)}
                                            icon={<FontAwesomeIcon icon={faEye} />}
                                        />
                                    </Button.Group>
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
                        {inventoryItem.categoryView.itemType === 'DEVICE' && inventoryItem.count === 1 && (
                            <Card size={'small'} title={'Imei'}>
                                {inventoryItem.imei}
                            </Card>
                        )}
                    </Space>
                )}
            </Space>
            <div className={'justify-around align-start flex-100 flex-wrap'}>
                <Descriptions bordered title={'Pricing'} layout={'horizontal'} column={3} className='mb-1'>
                    {inventoryItem?.purchasePrice && (
                        <Descriptions.Item
                            label={
                                <>
                                    Purchased for
                                    <FontAwesomeIcon icon={faCircleDollarToSlot} color='#ff0000'/>
                                </>
                            }
                        >
                            {currencyFormat(inventoryItem.purchasePrice)}
                        </Descriptions.Item>
                    )}
                    {inventoryItem?.sellPrice && (
                        <Descriptions.Item
                            label={
                                <>
                                    Selling Price
                                    <FontAwesomeIcon icon={faCashRegister} color='#00ff00' />
                                </>
                            }
                        >
                            {currencyFormat(inventoryItem.sellPrice)}
                        </Descriptions.Item>
                    )}

                    {inventoryItem?.purchasePrice && inventoryItem?.sellPrice && (
                        <Descriptions.Item label='Profit per item'>
                            {currencyFormat(+inventoryItem.sellPrice - +inventoryItem.purchasePrice)}
                        </Descriptions.Item>
                    )}
                </Descriptions>
                <Space wrap className={'w-100 justify-around'} style={{ flex: 3 }} align={'start'}>
                    <Card title={'Category specific properties'} extra={<Tag color={'blue'} children={'IMEI: ' + inventoryItem?.imei} />}>
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
    const { data: shops } = useQuery(['shops', 'short'], getWorkerShops)
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
            .catch((error?: AppError) => {
                setError('root', { message: error?.detail })
            })
    }

    useEffect(() => {
        reset()
    }, [item])

    return (
        <form onSubmit={handleSubmit(submit)} className={'modalForm'}>
            <Collapse
                items={[
                    {
                        key: '1',
                        label: 'Send to another shop',
                        children: (
                            <Space direction={'vertical'}>
                                <Controller
                                    control={control}
                                    name={'shopId'}
                                    render={({ field: { value, onChange }, fieldState }) => (
                                        <FormField label='Shop' error={fieldState.error}>
                                            <AppSelect<number, ItemPropertyView>
                                                onChange={onChange}
                                                options={shops?.filter((shop) => shop.id !== loggedUser?.shopId)}
                                                value={value}
                                                placeholder={'Shop to send to'}
                                                getOptionLabel={(shops) => shops.value}
                                                getOptionValue={(shops) => shops.id}
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
                            </Space>
                        ),
                    },
                ]}
            />
        </form>
    )
}

export const printItemLabel = async (inventoryItem: InventoryItem, openPreview?: boolean) => {
    const blob = await postPrintItemLabel(inventoryItem?.id)
    openPreview && openPdfBlob(blob)
}
export const previewItemLabel = async (inventoryItem: InventoryItem) => {
    const blob = await getPrintItemLabel(inventoryItem?.id)
    openPdfBlob(blob)
}
