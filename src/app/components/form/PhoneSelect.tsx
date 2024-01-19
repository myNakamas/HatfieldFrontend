import data from '../../utils/phoneCodes.json'
import { Input, Select, Space } from 'antd'
import { ReactNode, useEffect, useState } from 'react'
import { FormError } from './FormError'

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
    error,
    extra,
}: {
    value: string
    onChange: (value: string | undefined) => void
    error?: string
    extra?: ReactNode
}) => {
    const defaultCode = data.find(({ dial_code }) => value.startsWith(dial_code)) ?? UKCodeDefault
    const [selectedPhoneCode, setSelectedPhoneCode] = useState<string>(defaultCode.dial_code)
    const [phoneNumber, setPhoneNumber] = useState(value.replace(defaultCode.dial_code, '') ?? '')

    const handlePhoneCodeChange = (newCode: string) => {
        setSelectedPhoneCode(newCode)
        const newValue = newCode + '-' + phoneNumber
        onChange(newValue)
    }

    const handlePhoneNumberChange = (newPhoneNumber: string) => {
        setPhoneNumber(newPhoneNumber)
        const newValue = selectedPhoneCode + '-' + newPhoneNumber
        onChange(newValue)
    }
    useEffect(() => {
        const phoneParts = value.split('-')
        if (phoneParts.length === 2) {
            setSelectedPhoneCode(phoneParts[0])
            setPhoneNumber(phoneParts[1])
        }
    }, [value])
    return (
        <Space.Compact>
            <Input
                placeholder={'Add phone'}
                addonBefore={
                    <Select<string, PhoneCode>
                        options={data}
                        showSearch
                        style={{ width: 150 }}
                        filterOption={filterOptions}
                        fieldNames={{ value: 'dial_code', label: 'label' }}
                        value={selectedPhoneCode}
                        onChange={handlePhoneCodeChange}
                    />
                }
                value={phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.currentTarget.value)}
            />
            {extra}
            <FormError error={error} />
        </Space.Compact>
    )
}
