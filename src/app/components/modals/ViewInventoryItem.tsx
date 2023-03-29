import { InventoryItem } from '../../models/interfaces/shop'
import { AppModal } from './AppModal'
import { Descriptions, Space } from 'antd'

export const ViewInventoryItem = ({
    inventoryItem,
    closeModal,
}: {
    inventoryItem?: InventoryItem
    closeModal: () => void
}) => {
    return (
        <AppModal isModalOpen={!!inventoryItem} closeModal={closeModal} title={'Inventory Item'}>
            {inventoryItem && (
                <Space direction='vertical'>
                    <h2>todo:Update</h2>
                    <Descriptions title={'Properties'} bordered>
                        {Object.entries(inventoryItem.columns).map(([name, value], index) => (
                            <Descriptions.Item key={name + index} label={name}>
                                {value}
                            </Descriptions.Item>
                        ))}
                    </Descriptions>
                </Space>
            )}
        </AppModal>
    )
}
