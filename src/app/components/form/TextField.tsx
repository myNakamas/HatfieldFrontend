import {
    Control,
    Controller,
    FieldError,
    FieldValues,
    Path,
    PathValue,
    UseFormRegisterReturn,
    UseFormSetValue,
} from 'react-hook-form'
import React, { ReactNode, useState } from 'react'
import { FormError } from './FormError'
import {
    Button,
    Card,
    Collapse,
    DatePicker,
    DatePickerProps,
    Flex,
    Form,
    Input,
    InputProps,
    Slider,
    Space,
    Statistic,
    Tag,
    Typography,
} from 'antd'
import { AntFormField } from './Field'
import dateFormat from 'dateformat'
import duration,{Duration} from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs, { Dayjs } from 'dayjs';
dayjs.extend(relativeTime)
dayjs.extend(duration)


interface TextFieldProps
    extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    register?: UseFormRegisterReturn
    label?: string
    error?: FieldError
    // placeholder?: string
    // type?: string
    // defaultValue?: string
    button?: ReactNode
}

export const TextField = ({ label, error, button, register, ...rest }: TextFieldProps) => {
    return (
        <div className='textField'>
            <label>
                {label}
                <div className='flex-100 align-center'>
                    <input className={`input ${error && 'error'}`} {...register} {...rest} />
                    {button}
                </div>
                <FormError error={error?.message} />
            </label>
        </div>
    )
}
interface AntTextFieldProps<T extends FieldValues> {
    control: Control<T, any>
    name: Path<T>
    label?: string
    extra?: ReactNode
}
export const AntTextField = <T extends FieldValues>({
    label,
    extra,
    addonAfter,
    ...rest
}: AntTextFieldProps<T> & Omit<InputProps, 'defaultValue'|'addonAfter'> & {addonBefore?: ReactNode, addonAfter?: ReactNode}) => {
    return (
        <Controller
            {...rest}
            render={({ field, fieldState: { error } }) => (
                <AntFormField {...{ label, error, extra }}>
                    <Space.Compact>
                        <Input status={error?.message ? 'error' : undefined} {...field} {...rest} />
                        {addonAfter}
                    </Space.Compact>
                </AntFormField>
            )}
        />
    )
}

interface TaskDeadlineProps<T extends FieldValues> {
    duration?: Duration,
    setDuration: (duration?: Duration) => void
    control: Control<T, any>
    name: Path<T>
    label?: string
    extra?: ReactNode
}
export const TaskDeadline = <T extends FieldValues>({ label, extra, setDuration,duration, ...rest }: TaskDeadlineProps<T>) => {
    return (
        <Controller
            {...rest}
            render={({ field: { onChange, value: deadline }, fieldState: { error } }) => {
                const currentDeadline = duration ? dayjs().add(duration) : dayjs(deadline);
                const updateDeadline = (duration: Duration) => {
                    setDuration(duration)
                    onChange(dayjs().add(duration).toDate())
                }
                return (
                    <Collapse
                        size='small'
                        items={[
                            {
                                label: 'Deadline',
                                extra: (
                                    <Tag color={currentDeadline < dayjs().add(30, 'minutes') ? 'red' : 'blue'}>
                                        {currentDeadline?.fromNow()}
                                    </Tag>
                                ),
                                children: (
                                    <Space orientation='vertical'>
                                        <DatePicker
                                            onChange={(value) => {
                                                onChange(value)
                                                setDuration(undefined)
                                            }}
                                            value={deadline ? dayjs(deadline) : undefined}
                                            showTime
                                        />
                                        <Space.Compact>
                                            <Button
                                                onClick={() => {
                                                    updateDeadline(dayjs.duration({ minutes: 15 }))
                                                }}
                                            >
                                                15 minutes
                                            </Button>
                                            <Button onClick={() => updateDeadline(dayjs.duration({ minutes: 20 }))}>
                                                20 minutes
                                            </Button>
                                            <Button onClick={() => updateDeadline(dayjs.duration({ minutes: 45 }))}>
                                                45 minutes
                                            </Button>
                                        </Space.Compact>
                                        <Space.Compact>
                                            <Button onClick={() => updateDeadline(dayjs.duration({ hours: 1 }))}>
                                                1 hour
                                            </Button>
                                            <Button onClick={() => updateDeadline(dayjs.duration({ hours: 2 }))}>
                                                2 hours
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setDuration(undefined)
                                                    onChange(
                                                        dayjs().add(1, 'days').hour(10).minute(0).second(0).toDate()
                                                    )
                                                }}
                                            >
                                                10 AM Tomorrow
                                            </Button>
                                        </Space.Compact>
                                    </Space>
                                ),
                            },
                        ]}
                    />
                )
            }}
        />
    )
}
const MyDatePanel = (props: { value?: Dayjs; onSelect: (value?: Dayjs) => void }) => {
    const { value, onSelect } = props

    // Value
    const startDate = React.useMemo(() => dayjs().date(1).month(0), [])
    const [innerValue, setInnerValue] = React.useState(value || startDate)

    React.useEffect(() => {
        if (value) {
            setInnerValue(value)
        }
    }, [value])

    // Range
    const dateCount = React.useMemo(() => {
        const endDate = startDate.add(1, 'year').add(-1, 'day')
        return endDate.diff(startDate, 'day')
    }, [startDate])

    const sliderValue = Math.min(Math.max(0, innerValue.diff(startDate, 'day')), dateCount)

    // Render
    return (
        <Flex vertical gap='small' style={{ padding: 16 }}>
            <Typography.Title level={4} style={{ margin: 0 }} title="no, it's not">
                The BEST Picker Panel
            </Typography.Title>
            <Slider
                min={0}
                max={dateCount}
                value={sliderValue}
                onChange={(nextValue) => {
                    const nextDate = startDate.add(nextValue, 'day')
                    setInnerValue(nextDate)
                }}
                tooltip={{
                    formatter: (nextValue) => startDate.add(nextValue || 0, 'day').format('YYYY-MM-DD'),
                }}
            />
            <Button
                type='primary'
                onClick={() => {
                    onSelect(innerValue)
                }}
            >{`That's It!`}</Button>
        </Flex>
    )
}
