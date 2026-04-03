import React from 'react';
import { Select, SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';   // ← Correct import for AntD 6
import { User } from '../../models/interfaces/user'; // keep if needed

// ====================== AppCreatableSelect ======================
export const AppCreatableSelect = <T extends DefaultOptionType>({
    options,
    onChange,
    value,
    getOptionLabel,
    getOptionValue,
    ...selectProps
}: {
    onChange: (value: string | null) => void;
    getOptionLabel?: (value: T) => string;
    getOptionValue?: (value: T) => string;
    value?: string;
} & Omit<SelectProps<string[], T>, 'value' | 'onChange' | 'mode'>) => {

    const selectOptions = options?.map((item) => ({
        ...item,
        label: getOptionLabel ? getOptionLabel(item) : (item.label ?? item.value),
        value: getOptionValue ? getOptionValue(item) : item.value,
    }));

    const onUpdate = (newValue: string | null) => {
        onChange?.(newValue);
    };

    const clearValue = () => onUpdate(null);

    // Handle showSearch as boolean | SearchConfig
    const getOptionFilterProp = (): string => {
        const showSearch = selectProps?.showSearch;

        if (typeof showSearch === 'object' && showSearch !== null && 'optionFilterProp' in showSearch) {
            const prop = showSearch.optionFilterProp;
            if (!prop) return 'label';
            if (Array.isArray(prop)) return prop[0] ?? 'label';
            return prop as string;
        }
        return 'label';
    };

    const defaultFilterOption = (inputValue: string, item?: T) => {
        if (!item) return false;
        const filter = getOptionFilterProp();
        return String((item as any)[filter] ?? '')
            .toLowerCase()
            .includes(inputValue.toLowerCase());
    };

    return (
        <Select<string[], T>
            mode="tags"
            allowClear
            showSearch={{
                            filterOption:defaultFilterOption,
                            onSearch:() => {
                if (value) clearValue();
            }

            }}
            style={{ minWidth: 200, maxWidth: 300, textAlign: 'left' }}
            // AntD 6 replacement for dropdownStyle
            styles={{
                popup: { listItem:{ textAlign: 'left' } },
            }}
            tagRender={(props) => (
                <div key={`key${props.label}_${props.value}`} className="ps-1">
                    {props.label}
                </div>
            )}

            options={selectOptions}
            value={value ? [value] : []}
            onClear={clearValue}
            onDeselect={clearValue}
            onChange={(newValue: any) => {
                if (Array.isArray(newValue)) {
                    onUpdate(newValue[newValue.length - 1] ?? null);
                } else {
                    onUpdate(newValue);
                }
            }}
            {...selectProps}
        />
    );
};

// ====================== AppSelect ======================
export const AppSelect = <I, T extends DefaultOptionType>({
    options,
    onChange,
    value,
    getOptionLabel,
    getOptionValue,
    optionFilterProp,
    ...selectProps
}: {
    onChange?: (value: I | null) => void;
    getOptionLabel?: (value: T) => string;
    getOptionValue?: (value: T) => I;
    options?: T[];
    value?: I;
    optionFilterProp?: string;
    placeholder?: string;
} & Omit<SelectProps<I, T>, 'options' | 'onChange' | 'value' | 'showSearch'>) => {

    const selectOptions = options?.map((item) => ({
        ...item,
        label: getOptionLabel ? getOptionLabel(item) : item.label,
        value: getOptionValue ? getOptionValue(item) : item.value,
    }));

    const onUpdate = (newValue: I | null) => {
        onChange?.(newValue);
    };

    const clearValue = () => onUpdate(null);

    const defaultFilterOption = (inputValue: string, item?: T) =>
        item
            ? String((item as any)[optionFilterProp ?? 'label'] ?? '')
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
            : false;

    return (
        <Select<I, T>
            allowClear
            style={{ minWidth: 200, maxWidth: 300, textAlign: 'left' }}
            styles={{
                popup: { listItem:{ textAlign: 'left' } },
            }}
            options={selectOptions}
            value={value}
            showSearch={{
                optionFilterProp: optionFilterProp,
                filterOption:(a,b)=>defaultFilterOption(a,b),
            }}
            onClear={clearValue}
            optionLabelProp={optionFilterProp}
            onChange={(newValue) => onUpdate(newValue as I | null)}
            {...selectProps}
        />
    );
};