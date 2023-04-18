import { InventoryItem } from '../../../models/interfaces/shop'
import { AppModal } from '../AppModal'
import { Button, Card, Descriptions, Divider, Space, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import React, { useState } from 'react'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons/faShoppingCart'
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint'
import { postPrintItemLabel } from '../../../axios/http/documentRequests'
import { AddUsedItem } from '../ticket/AddUsedItem'
import { CreateUsedItem } from '../../../models/interfaces/ticket'

export const ViewInventoryItem = ({
    inventoryItem,
    closeModal,
    openEditModal,
}: {
    inventoryItem?: InventoryItem
    closeModal: () => void
    openEditModal?: (item: InventoryItem) => void
}) => {
    // const [sellModalOpen, setSellModalOpen] = useState(false)
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
            {
                //todo:Display sell item modal
                /*inventoryItem && (
                <SellItem usedItem={inventoryItem} closeModal={() => setSellModalOpen(false)} show={sellModalOpen} />
            )*/
            }
            {inventoryItem && (
                <Space direction='vertical' style={{ width: '100%' }}>
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
                                <Button icon={<FontAwesomeIcon icon={faShoppingCart} />}>Sell</Button>
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
