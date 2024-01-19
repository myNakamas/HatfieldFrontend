import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { AddItemInventorySchema } from '../../../models/validators/FormValidators'
import { Category, CreateInventoryItem, InventoryItem, Shop } from '../../../models/interfaces/shop'
import {
    addCategory,
    addNewItem,
    getAllBrands,
    getAllCategories,
    getAllShops,
    getShopData,
} from '../../../axios/http/shopRequests'
import { useQuery, useQueryClient } from 'react-query'
import { TextField } from '../../form/TextField'
import { FormError } from '../../form/FormError'
import { AppModal } from '../AppModal'
import { useContext, useEffect, useRef, useState } from 'react'
import { FormField } from '../../form/Field'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { toast } from 'react-toastify'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { Button, Card, Divider, Input, Space, Tag, Tooltip } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons'
import { AddEditCategory } from '../AddEditCategory'
import { AuthContext } from '../../../contexts/AuthContext'
import { AppCreatableSelect, AppSelect } from '../../form/AppSelect'
import { printItemLabel } from './ViewInventoryItem'
import { currencyFormat } from '../../../utils/helperFunctions'
import { usePrintConfirm } from '../PrintConfirm'

export const AddInventoryItem = ({
    isModalOpen,
    closeModal,
}: {
    isModalOpen: boolean
    closeModal: (item?: InventoryItem) => void
}) => {
    const { data: shop } = useQuery(['currentShop'], getShopData, { suspense: true })
    const { isWorker } = useContext(AuthContext)

    return (
        <AppModal {...{ isModalOpen, closeModal }} title={`Adding item to ${shop?.shopName}`} isForbidden={!isWorker()}>
            <AddInventoryItemInner {...{ isModalOpen, closeModal }} />
        </AppModal>
    )
}

export const AddInventoryItemInner = ({
    isModalOpen,
    closeModal,
}: {
    isModalOpen: boolean
    closeModal: (item?: InventoryItem) => void
}) => {
    const formRef = useRef<HTMLFormElement>(null)
    const { isAdmin } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const { data: brands } = useQuery('brands', getAllBrands, { suspense: true })
    const { data: categories } = useQuery(['allCategories'], getAllCategories, { suspense: true })
    const { data: shop } = useQuery(['currentShop'], getShopData, { suspense: true })
    const { data: shops } = useQuery('shops', getAllShops, { enabled: isAdmin(), suspense: true })

    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState<Category>()
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const { printConfirm: print } = usePrintConfirm()
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
        watch,
        setValue,
        reset,
        resetField,
    } = useForm<CreateInventoryItem>({
        resolver: yupResolver(AddItemInventorySchema),
        defaultValues: { shopId: shop?.id, count: 1 },
    })
    const models = watch('brand')?.models ?? []

    const onCreateCategory = async (formValue: Category) => {
        const category_1 = await addCategory(formValue)
        setShowCategoryModal(false)
        await queryClient.invalidateQueries(['allCategories'])
        setValue('categoryId', category_1.id)
    }

    const submit = (item: CreateInventoryItem) => {
        setLoading(true)
        toast
            .promise(addNewItem({ item }), toastCreatePromiseTemplate('item'), toastProps)
            .then((value) => {
                formRef.current?.reset()
                reset({})
                return queryClient
                    .invalidateQueries(['shopItems'])
                    .then(() => closeModal(value))
                    .then(() => {
                        print({
                            title: 'Print item label',
                            content: <ItemPrintConfirmContent item={value} />,
                            onOk: () => printItemLabel(value),
                        })
                    })
            })
            .then(() => queryClient.invalidateQueries(['brands']))
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
            .finally(() => setLoading(false))
    }
    useEffect(() => {
        formRef.current?.reset()
        reset()
    }, [isModalOpen])
    useEffect(() => {
        const c = categories?.find((category) => category.id === watch('categoryId'))
        if (c?.itemType != 'DEVICE') setValue('imei', undefined)
        setCategory(c)
    }, [watch('categoryId')])

    useEffect(() => {
        const category = categories?.find((category) => category.id === watch('categoryId'))
        const brand = watch('brand')?.value
        const model = watch('model')?.value
        setValue('name', `${category?.name ?? ''} ${brand ?? ''} ${model ?? ''}`.trim())
    }, [watch('categoryId'), watch('brand'), watch('model')])

    return (
        <>
            <AddEditCategory
                closeModal={() => setShowCategoryModal(false)}
                isModalOpen={showCategoryModal}
                onComplete={onCreateCategory}
                category={{} as Category}
            />
            <form className='modalForm' onSubmit={handleSubmit(submit)} ref={formRef}>
                <Input
                    title='The name of the item'
                    value={watch('name')}
                    bordered={false}
                    disabled
                    placeholder={'Fill the form below to create the item name'}
                />

                <Space wrap className={'justify-between w-100'}>
                    <Controller
                        control={control}
                        name='categoryId'
                        render={({ field, fieldState }) => {
                            return (
                                <FormField label={'Item Category'} error={fieldState.error}>
                                    <Space.Compact>
                                        <AppSelect<number, Category>
                                            options={categories}
                                            placeholder='Select Item Category'
                                            value={field.value}
                                            onChange={(id) => field.onChange(id)}
                                            getOptionLabel={(category) => category.name}
                                            getOptionValue={(category) => category.id}
                                        />
                                        {isAdmin() && (
                                            <Button
                                                onClick={() => {
                                                    setShowCategoryModal(true)
                                                }}
                                                icon={<FontAwesomeIcon icon={faPlus} />}
                                            >
                                                Add a new category
                                            </Button>
                                        )}
                                    </Space.Compact>
                                </FormField>
                            )
                        }}
                    />
                    <Space wrap>
                        <Controller
                            control={control}
                            name={'brand'}
                            render={({ field, fieldState }) => (
                                <FormField label='Brand' error={fieldState.error}>
                                    <AppCreatableSelect<ItemPropertyView>
                                        options={brands}
                                        placeholder='Select or add a new brand'
                                        value={field.value?.value}
                                        onChange={(newValue) => {
                                            resetField('model')
                                            field.onChange(
                                                brands?.find((brand) => brand.value === newValue) ?? { value: newValue }
                                            )
                                        }}
                                        optionLabelProp={'value'}
                                        optionFilterProp={'value'}
                                    />
                                </FormField>
                            )}
                        />
                        <Controller
                            control={control}
                            name={'model'}
                            render={({ field, fieldState }) => (
                                <FormField label='Model' error={fieldState.error}>
                                    <AppCreatableSelect<ItemPropertyView>
                                        options={models}
                                        placeholder='Select or add a new model'
                                        value={field.value?.value}
                                        onChange={(item) => field.onChange(item ? { value: item } : null)}
                                        optionLabelProp={'value'}
                                        optionFilterProp={'value'}
                                    />
                                </FormField>
                            )}
                        />
                    </Space>
                </Space>
                <Space wrap align={'start'} className={'w-100 justify-between'}>
                    <Space direction={'vertical'}>
                        <Space>
                            <TextField
                                label='Count'
                                register={register('count')}
                                error={errors.count}
                                type='number'
                                placeholder='Number of items'
                            />
                            {category?.itemType === 'DEVICE' && +watch('count') === 1 && (
                                <TextField
                                    label='Imei'
                                    defaultValue={watch('imei')}
                                    register={register('imei')}
                                    error={errors.name}
                                    placeholder={'Serial number / Imei'}
                                />
                            )}
                        </Space>
                        {isAdmin() && (
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <FormField label={'Shop to add the item to'}>
                                        <AppSelect<number, Shop>
                                            value={field.value}
                                            options={shops}
                                            placeholder='Assign to shop'
                                            onChange={(shopId) => field.onChange(shopId)}
                                            getOptionLabel={(shop) => shop.shopName}
                                            getOptionValue={(shop) => shop.id}
                                        />
                                    </FormField>
                                )}
                                name={'shopId'}
                            />
                        )}
                    </Space>
                    <Card title={'Pricing'}>
                        <Space wrap className={'w-100 justify-between'}>
                            <TextField
                                label='Purchase Price'
                                register={register('purchasePrice')}
                                error={errors.purchasePrice}
                                type='currency'
                            />
                            <TextField
                                label='Sell Price'
                                register={register('sellPrice')}
                                error={errors.sellPrice}
                                type='currency'
                            />
                        </Space>
                    </Card>
                </Space>
                {category && category.columns.length > 0 && (
                    <Card title={category.name + ' properties'}>
                        {category.columns?.map((column, index) => (
                            <TextField
                                button={
                                    column.showOnDocument && (
                                        <Tooltip
                                            title={`The ${column.name} will be visible on the printing label ${
                                                column.showNameOnDocument && 'with the column name'
                                            }`}
                                        >
                                            <Tag icon={<FontAwesomeIcon icon={faEye} />} />
                                        </Tooltip>
                                    )
                                }
                                register={register(`properties.${column.name}`)}
                                label={column.name}
                                key={column.name + index}
                            />
                        ))}
                    </Card>
                )}

                <FormError error={errors.root?.message} />
                <div className='flex-100 justify-end'>
                    <Button type='primary' htmlType='submit' loading={loading}>
                        Save
                    </Button>
                    <Button htmlType='button' onClick={() => closeModal()}>
                        Close
                    </Button>
                </div>
            </form>
        </>
    )
}

const ItemPrintConfirmContent = ({ item }: { item: InventoryItem }) => {
    return (
        <p className='viewModal'>
            - Ticket label for the device x1
            <br />
            <Divider>Item #{item.id}</Divider>
            Name: {item.name} <br />
            Price: {currencyFormat(item.sellPrice)} <br />
            {item.imei && (
                <>
                    Serial Number / Imei: {item.imei} <br />
                </>
            )}
        </p>
    )
}
