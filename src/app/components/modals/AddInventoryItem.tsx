import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AddItemInventorySchema } from "../../models/validators/FormValidators";
import { InventoryItem, ItemPropertyView } from "../../models/interfaces/shop";
import { addNewItem, getAllBrands, getAllModels, getShopData } from "../../axios/shopRequests";
import { useQuery } from "react-query";
import { TextField } from "../form/TextField";
import { FormError } from "../form/FormError";
import { AppModal } from "./AppModal";
import { FormSelect } from "../form/FormSelect";
import React from "react";
import Select from "react-select";

export const AddInventoryItem = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const { data: models } = useQuery('models', getAllModels)
    const { data: brands } = useQuery('brands', getAllBrands)
    const { data: shop } = useQuery('shop', getShopData)
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<InventoryItem>({ resolver: yupResolver(AddItemInventorySchema), defaultValues:{shopId:shop?.id} })
    const submit = async (formValue: InventoryItem) => {
        if (shop) {
            console.log("item: ",formValue)
            const item = { ...formValue,type:formValue.type.toUpperCase(), shopId: shop.id }
            const response = addNewItem({ item })
        } else {
            setError('root', { type: 'shopId', message: 'You are not assigned to any shop' })
        }
    }

    return (
        <AppModal {...{ isModalOpen, closeModal }}>
            <h2>Add inventory item</h2>
            <form className='modalForm' onSubmit={handleSubmit(submit)}>
                <div className='textFormLabel'>Adding item to shop:</div>
                <input readOnly className='input' disabled defaultValue={shop?.shopName}/>
                <FormSelect<ItemPropertyView>
                    control={control}
                    name='brand'
                    label='Brand'
                    options={brands}
                    isCreatable
                    placeholder='Select or add a new brand'
                    getOptionLabel={(item) => item.value}
                    getOptionValue={(item) => String(item.id)}
                />
                <FormSelect<ItemPropertyView>
                    control={control}
                    name='model'
                    label='Model'
                    options={models}
                    isCreatable
                    placeholder='Select or add a new model'
                    getOptionLabel={(item) => item.value}
                    getOptionValue={(item) => String(item.id)}
                />
                <Controller control={control}  name='type' render={({ field, fieldState }) => {
                    return <div className="field">
                        <div className="flex justify-start textFormLabel">Item type</div>
                        <Select
                          name="type"
                          options={[
                              //todo: export to a default values file
                              { id: 1, value: "Device" },
                              { id: 2, value: "Part" }
                          ]}
                          placeholder="Select Item Type"
                          onChange={type => field.onChange(type?.value)}
                          getOptionLabel={(item) => item.value}
                          getOptionValue={(item) => String(item.id)}
                        />
                        <FormError error={fieldState.error?.message} />
                    </div>;
                }}
                />

                <TextField label='Count' register={register('count')} error={errors.count} type='number' />
                <FormError error={errors.root?.message} />
                <div className='flex justify-end'>
                    <button className='successButton' type='submit'>
                        Create
                    </button>
                    <button className='cancelButton' onClick={closeModal}>
                        Close
                    </button>
                </div>
            </form>
        </AppModal>
    )
}
