import { useQuery, useQueryClient } from 'react-query'
import { addCategory, getAllCategories, updateCategory } from '../../axios/http/shopRequests'
import { Category } from '../../models/interfaces/shop'
import { CustomSuspense } from '../../components/CustomSuspense'
import { CustomTable } from '../../components/table/CustomTable'
import { AddInventoryCategory } from '../../components/modals/AddEditCategory'
import { useState } from 'react'

export const CategorySettings = () => {
    //todo: add edit button
    const { data: allCategories, isLoading } = useQuery(['allCategories'], () => getAllCategories())
    const queryClient = useQueryClient()
    //todo: Research the best way to invalidate the caches query client ( maybe pass the query client as a context )
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
                <div className='width-m'>
                    {allCategories && allCategories.length > 0 && (
                        <CustomTable<Category>
                            headers={['']}
                            data={allCategories.map(({ columns, ...rest }) => ({
                                ...rest,
                                columns: columns.join(', '),
                            }))}
                            onClick={(value) => {
                                setSelectedCategory(value)
                            }}
                        />
                    )}
                </div>
            </CustomSuspense>
        </div>
    )
}
