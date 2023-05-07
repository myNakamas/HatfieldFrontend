import { useQuery, useQueryClient } from 'react-query'
import { addCategory, getAllCategories, updateCategory } from '../../axios/http/shopRequests'
import { Category } from '../../models/interfaces/shop'
import { CustomSuspense } from '../../components/CustomSuspense'
import { CustomTable } from '../../components/table/CustomTable'
import { AddEditCategory } from '../../components/modals/AddEditCategory'
import { useState } from 'react'
import { Button, Popconfirm, Space } from 'antd'
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { deleteCategory } from '../../axios/http/settingsRequests'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { toast } from 'react-toastify'
import { toastProps } from '../../components/modals/ToastProps'

export const CategorySettings = () => {
    const { data: allCategories, isLoading } = useQuery(['allCategories'], () => getAllCategories())
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()

    const onUpdate = (formValue: Category) => {
        return updateCategory(formValue).then(() => {
            setSelectedCategory(undefined)
            toast.success('Successfully updated the selected category', toastProps)
            queryClient.invalidateQueries(['allCategories']).then()
        })
    }
    const onCreate = (formValue: Category) => {
        return addCategory(formValue).then(() => {
            setShowModal(false)
            toast.success('Successfully created a new category', toastProps)
            queryClient.invalidateQueries(['allCategories']).then()
        })
    }

    return (
        <div className='mainScreen'>
            <Space className='button-bar'>
                <Button onClick={() => setShowModal(true)}>Add new category</Button>
            </Space>
            <AddEditCategory
                closeModal={() => setSelectedCategory(undefined)}
                isModalOpen={!!selectedCategory}
                onComplete={onUpdate}
                category={selectedCategory}
            />
            <AddEditCategory
                closeModal={() => setShowModal(false)}
                isModalOpen={showModal}
                onComplete={onCreate}
                category={{} as Category}
            />
            <CustomSuspense isReady={!isLoading}>
                {allCategories && allCategories.length > 0 ? (
                    <CustomTable<Category>
                        data={allCategories.map((category) => ({
                            ...category,
                            columns: category.columns.join(', '),
                            actions: (
                                <Space>
                                    <Button
                                        icon={<FontAwesomeIcon icon={faPen} />}
                                        onClick={() => setSelectedCategory(category)}
                                    />
                                    <Popconfirm
                                        title='Delete the category'
                                        description='Are you sure to delete this category?'
                                        onConfirm={() =>
                                            deleteCategory(category.id).then(() =>
                                                queryClient.invalidateQueries(['allCategories']).then()
                                            )
                                        }
                                        okText='Yes'
                                        cancelText='No'
                                    >
                                        <Button icon={<FontAwesomeIcon icon={faTrashCan} />} />
                                    </Popconfirm>
                                </Space>
                            ),
                        }))}
                        headers={{
                            name: 'name',
                            itemType: 'type',
                            columns: 'columns',
                            actions: 'actions',
                        }}
                        onClick={(category) => {
                            setSelectedCategory(category)
                        }}
                    />
                ) : (
                    <NoDataComponent items={'categories'}>
                        <Button type={'primary'} onClick={() => setShowModal(true)}>
                            Add new category
                        </Button>
                    </NoDataComponent>
                )}
            </CustomSuspense>
        </div>
    )
}
