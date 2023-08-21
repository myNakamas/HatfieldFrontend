import { useQuery, useQueryClient } from 'react-query'
import {
    addCategory,
    getAllBrands,
    getAllCategories,
    patchRenameModel,
    updateCategory,
} from '../../axios/http/shopRequests'
import { Brand, Category } from '../../models/interfaces/shop'
import { CustomSuspense } from '../../components/CustomSuspense'
import { CustomTable } from '../../components/table/CustomTable'
import { AddEditCategory } from '../../components/modals/AddEditCategory'
import React, { useState } from 'react'
import { Breadcrumb, Button, Collapse, Divider, Input, Popconfirm, Space } from 'antd'
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { deleteCategory } from '../../axios/http/settingsRequests'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { useNavigate } from 'react-router-dom'
import { FormField } from '../../components/form/Field'
import { ItemPropertyView } from '../../models/interfaces/generalModels'

export const CategorySettings = () => {
    const { data: allCategories, isLoading } = useQuery(['allCategories'], () => getAllCategories())
    const queryClient = useQueryClient()
    const navigate = useNavigate()
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
            <Breadcrumb
                items={[
                    { title: <a onClick={() => navigate('/home')}>Home</a> },
                    { title: <a onClick={() => navigate('/inventory')}>Inventory</a> },
                    { title: 'Categories' },
                ]}
            />
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
            <Space direction={'vertical'} className={'w-100'}>
                <Divider children={'Categories'} />
                <CustomSuspense isReady={!isLoading}>
                    {allCategories && allCategories.length > 0 ? (
                        <CustomTable<Category>
                            data={allCategories.map((category) => ({
                                ...category,
                                columnsNames: category.columns.join(', '),
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
                                columnsNames: 'columns',
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
                <Divider children={'Brands and Models'} />

                <BrandAndModelEdit />
            </Space>
        </div>
    )
}

const ModelRow = ({ model }: { model: ItemPropertyView }) => {
    const queryClient = useQueryClient()
    const [name, setName] = useState('')

    const renameModel = (id: number, name: string) => {
        toast
            .promise(patchRenameModel({ id, value: name }), toastUpdatePromiseTemplate('model'), toastProps)
            .then(() => queryClient.invalidateQueries('brands'))
    }
    return (
        <Space>
            <Popconfirm
                title={'Rename model'}
                onConfirm={() => renameModel(model.id, name)}
                onCancel={() => setName('')}
                description={
                    <FormField label={'New name'}>
                        <Input
                            placeholder={'Rename the model'}
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                        />
                    </FormField>
                }
            >
                <Button icon={<FontAwesomeIcon icon={faPen} />}>Rename</Button>
            </Popconfirm>
        </Space>
    )
}

const BrandAndModelEdit = () => {
    const { data: brands } = useQuery('brands', getAllBrands)

    return (
        <>
            <Collapse
                items={brands?.map((brand: Brand, index: number) => ({
                    label: brand.value,
                    key: 'brand' + index,
                    children: (
                        <CustomTable
                            headers={{ id: 'Id', value: 'Model', actions: 'Actions' }}
                            data={brand.models.map((model) => {
                                return {
                                    ...model,
                                    actions: <ModelRow model={model} />,
                                }
                            })}
                        />
                    ),
                }))}
            />
        </>
    )
}
