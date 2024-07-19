import data from '../../utils/phoneCodes.json'
import { Input, Select, Space } from 'antd'
import { ReactNode, useEffect, useState } from 'react'
import { FormError } from './FormError'

interface Phone {
    phone: string
    code: string
}
const getPhoneString = (phone: Phone) => {
    return phone.code + '-' + phone.phone
}
const parsePhone = (str: string, code?: string) => {
    let result = { code: code ?? UKCodeDefault.dial_code, phone: '' }
    if (!str || str.trim().length == 0) return result
    const i = str.indexOf('-')
    if (i > 0) {
        const arr = str.split('-')
        result.code = arr[0]
        result.phone = arr[1]
    } else {
        result = parsePhoneNumber(str, result)
    }
    return result
}
const parsePhoneNumber = (str: string, result: Phone) => {
    if (str.startsWith('00')) str = str.replace(/^00/, '+')
    if (str.startsWith('+')) {
        const code = parseCode(str)
        if (code) {
            result.code = code.dial_code
            result.phone = str.replace(code.dial_code, '')
        }
    } else if (str.startsWith('0')) {
        result.phone = str.replace(/^0/, '')
    }
    return result
}
const parseCode = (str: string): PhoneCode | undefined => {
    return (
        data.find((entry) => entry.dial_code === str.substring(0, 5)) ??
        data.find((entry) => entry.dial_code === str.substring(0, 4)) ??
        data.find((entry) => entry.dial_code === str.substring(0, 3)) ??
        data.find((entry) => entry.dial_code === str.substring(0, 2)) ??
        data.find((entry) => entry.dial_code === str.substring(0, 1))
    )
}

interface PhoneCode {
    name: string
    dial_code: string
    code: string
    label: string
}

const UKCodeDefault: PhoneCode = {
    name: 'United Kingdom',
    dial_code: '+44',
    code: 'GB',
    label: 'GB +44',
}

const filterOptions = (inputValue: string, option?: PhoneCode) =>
    (option?.code ?? '').toLowerCase().includes(inputValue.toLowerCase()) ||
    (option?.dial_code ?? '').toLowerCase().includes(inputValue.toLowerCase()) ||
    (option?.name ?? '').toLowerCase().includes(inputValue.toLowerCase())

export const PhoneSelect = ({
    value,
    onChange,
    onBlur,
    error,
    extra,
}: {
    value: string
    onChange: (value: string | undefined) => void
    onBlur: () => void
    error?: string
    extra?: ReactNode
}) => {
    const [phone, setPhone] = useState<Phone>(parsePhone(value))
    const update = (phone: Phone) => {
        setPhone(phone)
        onChange(getPhoneString(phone))
    }
    return (
        <Space direction='vertical'>
            <Input
                placeholder={'Add phone'}
                addonBefore={
                    <Select<string, PhoneCode>
                        options={data}
                        showSearch
                        style={{ width: 150 }}
                        filterOption={filterOptions}
                        fieldNames={{ value: 'dial_code', label: 'label' }}
                        value={phone.code}
                        onChange={(newCode) => update({ ...phone, code: newCode })}
                    />
                }
                value={phone.phone}
                onBlur={(e) => {
                    update(parsePhoneNumber(e.currentTarget.value, phone))
                    onBlur()
                }}
                onChange={(e) => update({ ...phone, phone: e.currentTarget.value })}
                addonAfter={extra}
            />
            <FormError error={error} />
        </Space>
    )
}
