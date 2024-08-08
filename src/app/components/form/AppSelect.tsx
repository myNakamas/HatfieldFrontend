import { BaseOptionType, SelectProps } from 'antd/lib/select'
import React from 'react'
import { AutoComplete, AutoCompleteProps, Select } from 'antd'
import { User } from '../../models/interfaces/user'

export const AppCreatableSelect = <T extends BaseOptionType>({
    options,
    onChange,
    value,
    getOptionLabel,
    getOptionValue,
    ...selectProps
}: {
    onChange: (value: string | null) => void
    getOptionLabel?: (value: T) => string
    getOptionValue?: (value: T) => string
    value?:string,
} & Omit<SelectProps<string[], T>, 'value' | 'onChange'>) => {
    const selectOptions = options?.map((item) => ({
        ...item,
        key: getOptionLabel ? getOptionLabel(item) : item.label,
        label: getOptionLabel ? getOptionLabel(item) : item.label,
        value: getOptionValue ? getOptionValue(item) : item.value,
    }))
    const onUpdate = (value: string | null) => {
        onChange && onChange(value)
    }
    const clearValue = () => {
        onUpdate(null)
    }

    const defaultFilterOption = (inputValue: string, item?: T) =>
        item
            ? String(item[selectProps.optionFilterProp ?? 'label'])
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
            : false

    return (
        <Select<string[], T>
            mode={'tags'}
            onSearch={() => {
                if (value) clearValue()
            }}

            tagRender={(props) => (
                <div key={`key${props.label}_${props.value}`} className='ps-1'>
                    {props.label}
                </div>
            )}
            style={{ minWidth: 200, maxWidth: 300, textAlign: 'left' }}
            dropdownStyle={{ textAlign: 'left' }}
            allowClear
            showSearch
            onClear={clearValue}
            onDeselect={clearValue}
            options={selectOptions}
            onChange={(value: any,option) => {
                if (value instanceof Array) onUpdate(value[value.length - 1] ?? null)
                else onUpdate(value)
            }}
            value={value? [value]: []}
            filterOption={defaultFilterOption}
            {...selectProps}
        />
    )
}

export const AppSelect = <I, T extends BaseOptionType>({
    options,
    onChange,
    value,
    getOptionLabel,
    getOptionValue,
    optionFilterProp,
    ...selectProps
}: {
    onChange?: (value: I | null) => void
    getOptionLabel?: (value: T) => string
    getOptionValue?: (value: T) => I
    options?: T[]
    value?: I
    disabled?: boolean
    optionFilterProp?: string
    placeholder?: string
} & SelectProps<I, T>) => {
    const selectOptions = options?.map((item) => ({
        ...item,
        label: getOptionLabel && getOptionLabel(item),
        value: getOptionValue && getOptionValue(item),
    }))

    const onUpdate = (value: I | null) => {
        onChange && onChange(value)
    }
    const clearValue = () => {
        onUpdate(null)
    }
    const defaultFilterOption = (inputValue: string, item?: T) =>
        item
            ? String(item[optionFilterProp ?? 'label'])
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
            : false

    return (
        <Select<I, T>
            allowClear
            showSearch
            style={{ minWidth: 200, maxWidth: 300, textAlign: 'left' }}
            dropdownStyle={{ textAlign: 'left' }}
            onClear={() => clearValue()}
            options={selectOptions}
            onChange={(value) => onUpdate(value)}
            value={value}
            filterOption={defaultFilterOption}
            optionFilterProp={optionFilterProp}
            optionLabelProp={optionFilterProp}
            {...selectProps}
        />
    )
}


