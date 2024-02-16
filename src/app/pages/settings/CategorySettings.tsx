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
import { useContext, useState } from 'react'
import { Breadcrumb, Button, Collapse, Input, Popconfirm, Space, Tabs, Tag } from 'antd'
import { faPen, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { deleteCategory } from '../../axios/http/settingsRequests'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { useNavigate } from 'react-router-dom'
import { FormField } from '../../components/form/Field'
import { ItemPropertyView } from '../../models/interfaces/generalModels'
import { AuthContext } from '../../contexts/AuthContext'

export const CategorySettings = () => {
    const { data: allCategories, isLoading } = useQuery(['allCategories'], () => getAllCategories())
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { isAdmin } = useContext(AuthContext)
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
                <Button
                    disabled={!isAdmin()}
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => setShowModal(true)}
                >
                    Add new category
                </Button>
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
            <Tabs
                animated
                defaultActiveKey='categories'
                items={[
                    {
                        key: 'categories',
                        label: 'Categories',
                        children: (
                            <CustomSuspense isReady={!isLoading}>
                                {allCategories && allCategories.length > 0 ? (
                                    <CustomTable<Category>
                                        data={allCategories.map((category) => {
                                            return {
                                                ...category,
                                                columnsNames: category.columns.flatMap((c) => c.name).join(', '),
                                                actions: (
                                                    <Space>
                                                        <Button
                                                            icon={<FontAwesomeIcon icon={faPen} />}
                                                            disabled={!isAdmin()}
                                                            onClick={() => setSelectedCategory(category)}
                                                        />
                                                        <Popconfirm
                                                            title='Delete the category'
                                                            description='Are you sure to delete this category?'
                                                            onConfirm={() =>
                                                                deleteCategory(category.id).then(() =>
                                                                    queryClient
                                                                        .invalidateQueries(['allCategories'])
                                                                        .then()
                                                                )
                                                            }
                                                            disabled={!isAdmin()}
                                                            okText='Yes'
                                                            cancelText='No'
                                                        >
                                                            <Button
                                                                disabled={!isAdmin()}
                                                                danger
                                                                icon={<FontAwesomeIcon color='red' icon={faTrashCan} />}
                                                            />
                                                        </Popconfirm>
                                                    </Space>
                                                ),
                                            }
                                        })}
                                        headers={{
                                            name: 'name',
                                            itemType: 'type',
                                            columnsNames: 'columns',
                                            actions: 'actions',
                                        }}
                                        onClick={({ id }) => {
                                            setSelectedCategory(allCategories?.find((category) => category.id === id))
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
                        ),
                    },
                    { key: 'models', label: 'Brands and models', children: <BrandAndModelEdit /> },
                ]}
            />
        </div>
    )
}

const ModelRow = ({ model }: { model: ItemPropertyView }) => {
    const queryClient = useQueryClient()
    const [name, setName] = useState('')
    const { isAdmin } = useContext(AuthContext)

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
                disabled={!isAdmin()}
            >
                <Button disabled={!isAdmin()} icon={<FontAwesomeIcon icon={faPen} />}>
                    Rename
                </Button>
            </Popconfirm>
        </Space>
    )
}

const BrandAndModelEdit = () => {
    const { data: brands } = useQuery('brands', getAllBrands)

    return (
        <div className='w-100'>
            <Collapse
                defaultActiveKey={'brand0'}
                items={brands?.map((brand: Brand, index: number) => ({
                    label: brand.value,
                    key: 'brand' + index,
                    extra: <Tag title='Number of models'>{brand.models.length}</Tag>,
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
        </div>
    )
}
