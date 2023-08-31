import { BaseOptionType, SelectProps } from 'antd/lib/select'
import React from 'react'
import { Select } from 'antd'

export const AppCreatableSelect = <T extends BaseOptionType>({
    isCreatable,
    options,
    onChange,
    value,
    onCreateOption,
    getOptionLabel,
    getOptionValue,
    ...selectProps
}: {
    isCreatable?: boolean
    onChange: (value: string | null) => void
    onCreateOption?: (value: string) => void
    getOptionLabel?: (value: T) => string
    getOptionValue?: (value: T) => string
} & SelectProps<string, T>) => {
    const selectOptions = options?.map((item) => ({
        ...item,
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
        <Select<string, T>
            mode={'tags'}
            onSearch={() => {
                if (value) clearValue()
            }}
            onKeyDown={(event) => {
                if (event.key === 'Backspace') clearValue()
            }}
            tagRender={(props) => <div style={{ paddingLeft: 5 }}>{props.label}</div>}
            style={{ minWidth: 200, maxWidth: 300, textAlign: 'left' }}
            dropdownStyle={{ textAlign: 'left' }}
            allowClear
            showSearch
            onClear={() => clearValue()}
            options={selectOptions}
            onChange={(value: any) => {
                if (value instanceof Array) onUpdate(value[value.length - 1] ?? null)
                else onUpdate(value)
            }}
            value={[value] as any}
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
    isCreatable?: boolean
    onChange?: (value: I | null) => void
    onCreateOption?: (value: string) => void
    getOptionLabel?: (value: T) => string
    getOptionValue?: (value: T) => I
    options?: T[]
    value?: I
    disabled?: boolean
    optionFilterProp?: string
    placeholder?: string
}) => {
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
