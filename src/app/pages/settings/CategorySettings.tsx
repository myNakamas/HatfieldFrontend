import { useQuery, useQueryClient } from 'react-query'
import { addCategory, getAllCategories, updateCategory } from '../../axios/http/shopRequests'
import { Category } from '../../models/interfaces/shop'
import { CustomSuspense } from '../../components/CustomSuspense'
import { CustomTable } from '../../components/table/CustomTable'
import { AddInventoryCategory } from '../../components/modals/AddEditCategory'
import { useState } from 'react'
import { Button, Popconfirm } from 'antd'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { deleteCategory } from '../../axios/http/settingsRequests'

export const CategorySettings = () => {
    const { data: allCategories, isLoading } = useQuery(['allCategories'], () => getAllCategories())
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category>()

    const onUpdate = (formValue: Category) => {
        return updateCategory(formValue).then(() => {
            setShowEditModal(false)
            queryClient.invalidateQueries(['allCategories']).then()
        })
    }
    const onCreate = (formValue: Category) => {
        return addCategory(formValue).then(() => {
            setShowModal(false)
            queryClient.invalidateQueries(['allCategories']).then()
        })
    }

    return (
        <div className='mainScreen'>
            <div className='button-bar'>
                <button className='actionButton' onClick={() => setShowModal(true)}>
                    Add new category
                </button>
            </div>
            <AddInventoryCategory
                closeModal={() => setShowEditModal(false)}
                isModalOpen={showEditModal}
                onComplete={onUpdate}
                category={selectedCategory}
            />
            <AddInventoryCategory
                closeModal={() => setShowModal(false)}
                isModalOpen={showModal}
                onComplete={onCreate}
                category={{} as Category}
            />
            <CustomSuspense isReady={!isLoading}>
                {allCategories && (
                    <CustomTable<Category>
                        data={allCategories.map(({ columns, ...rest }) => ({
                            ...rest,
                            columns: columns.join(', '),
                            actions: (
                                <Popconfirm
                                    title='Delete the category'
                                    description='Are you sure to delete this category?'
                                    onConfirm={() => deleteCategory(rest.id)}
                                    okText='Yes'
                                    cancelText='No'
                                >
                                    <Button icon={<FontAwesomeIcon icon={faTrashCan} />} />
                                </Popconfirm>
                            ),
                        }))}
                        onClick={(value) => {
                            setSelectedCategory(value)
                        }}
                    />
                )}
            </CustomSuspense>
        </div>
    )
}
