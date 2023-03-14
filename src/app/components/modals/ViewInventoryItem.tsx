import { InventoryItem } from '../../models/interfaces/shop'
import { AppModal } from './AppModal'

export const ViewInventoryItem = ({
    inventoryItem,
    closeModal,
}: {
    inventoryItem?: InventoryItem
    closeModal: () => void
}) => {
    return (
        <AppModal isModalOpen={!!inventoryItem} closeModal={closeModal}>
            <h3>Inventory Item</h3>
            {inventoryItem && (
                <div>
                    <h3>Details</h3>
                    <div className='card'>
                        <Field name={'Brand'} value={inventoryItem.brand} />
                        <Field name={'Model'} value={inventoryItem.model} />
                        <Field name={'Available count'} value={String(inventoryItem.count)} />
                    </div>
                    <h3>Category</h3>
                    <div className='card'>
                        <Field name={'Category'} value={inventoryItem.categoryView.name} />
                        <Field name={'Item type'} value={inventoryItem.categoryView.itemType} />
                    </div>
                    <h3>Properties</h3>
                    <div className='card'>
                        {Object.entries(inventoryItem.columns).map(([name, value], index) => (
                            <Field key={name + index} {...{ name, value }} />
                        ))}
                    </div>
                </div>
            )}
        </AppModal>
    )
}
export const Field = ({ name, value }: { name: string; value: string | number }) => {
    return value ? (
        <div className='field'>
            <div>{name}</div>
            <div>{value}</div>
        </div>
    ) : (
        <></>
    )
}
