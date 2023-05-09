import { InventoryItem } from '../../../models/interfaces/shop'
import { AppModal } from '../AppModal'
import { Button, Card, Descriptions, Divider, Space, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import React, { ReactNode, useEffect, useState } from 'react'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'
import { postPrintItemLabel } from '../../../axios/http/documentRequests'
import { AddUsedItem } from '../ticket/AddUsedItem'
import { CreateUsedItem } from '../../../models/interfaces/ticket'
import { useForm } from 'react-hook-form'
import { TextField } from '../../form/TextField'
import { yupResolver } from '@hookform/resolvers/yup'
import { UpdateItemCountSchema } from '../../../models/validators/FormValidators'
import { updateItemQuantity } from '../../../axios/http/shopRequests'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { useQueryClient } from 'react-query'
import { AddInvoice } from '../AddInvoice'

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
    const printSellDocument = async () => {
        const blob = await postPrintItemLabel(inventoryItem?.id)
        if (blob) {
            const fileUrl = URL.createObjectURL(blob)
            window.open(fileUrl)
        }
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
                    <ItemDescriptions
                        inventoryItem={inventoryItem}
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
                    />

                    <Space wrap>
                        <Card title={'Actions'}>
                            <Space>
                                <Typography>Print the label for the item</Typography>
                                <Button onClick={printSellDocument} icon={<FontAwesomeIcon icon={faPrint} />}>
                                    Print
                                </Button>
                            </Space>
                            <Divider />
                            <Space>
                                <Typography>Sell as an item</Typography>
                                <Button
                                    icon={<FontAwesomeIcon icon={faShoppingCart} />}
                                    onClick={() => setSellModalOpen(true)}
                                >
                                    Sell
                                </Button>
                            </Space>
                            <Divider />
                            <Space>
                                <Typography>Use in a ticket</Typography>
                                <Button onClick={() => setIsUseModalOpen(true)} type={'primary'}>
                                    Add to ticket
                                </Button>
                            </Space>
                        </Card>
                        <Card title={'Modify item quantity'}>
                            <UpdateItemCountForm item={inventoryItem} onComplete={closeModal} />
                            <Divider />
                            <Space>
                                <Typography>Mark as damaged</Typography>
                                <Button disabled>Remove</Button>
                            </Space>
                            <Divider />
                            <Space>
                                <Typography>Mark as defective</Typography>
                                <Button disabled>Remove</Button>
                            </Space>
                            <Divider />
                            <Space>
                                <Typography>Send to another shop</Typography>
                                {/*    todo: add logic*/}
                                <Button disabled>Send</Button>
                            </Space>
                        </Card>
                    </Space>
                </Space>
            )}
        </AppModal>
    )
}

export const ItemDescriptions = ({ inventoryItem, extra }: { inventoryItem: InventoryItem; extra?: ReactNode }) => {
    return (
        <>
            <Descriptions size={'middle'} layout={'vertical'} column={3} bordered extra={extra}>
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
                        <Descriptions.Item label={'Type'}>{inventoryItem.categoryView.itemType}</Descriptions.Item>
                        <Descriptions.Item label={'Category name'}>{inventoryItem.categoryView.name}</Descriptions.Item>
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
        </>
    )
}

const UpdateItemCountForm = ({ item, onComplete }: { item: InventoryItem; onComplete: () => void }) => {
    const queryClient = useQueryClient()

    const {
        handleSubmit,
        register,
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
            <Space>
                <TextField
                    min={0}
                    defaultValue={item.count}
                    register={register('count')}
                    error={errors.count}
                    type='number'
                />
                <Button type={'primary'} htmlType={'submit'}>
                    Update
                </Button>
            </Space>
        </form>
    )
}
