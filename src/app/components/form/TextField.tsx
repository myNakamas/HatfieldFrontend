import { Control, Controller, FieldError, FieldValues, Path, PathValue, UseFormRegisterReturn } from 'react-hook-form'
import React, { ReactNode, useState } from 'react'
import { FormError } from './FormError'
import { Button, Card, DatePicker, DatePickerProps, Flex, Form, Input, InputProps, Slider, Space, Statistic, Typography } from 'antd'
import { AntFormField } from './Field'

import dateFormat from 'dateformat'
import moment, { Moment } from 'moment'

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
    ...rest
}: AntTextFieldProps<T> & Omit<InputProps, 'defaultValue'>) => {
    return (
        <Controller
            {...rest}
            render={({ field, fieldState: { error } }) => (
                <AntFormField {...{ label, error, extra }}>
                    <Input status={error?.message ? 'error' : undefined} {...field} {...rest} />
                </AntFormField>
            )}
        />
    )
}


interface TaskDeadlineProps<T extends FieldValues> {
    control: Control<T, any>
    name: Path<T>
    label?: string
    extra?: ReactNode
}
export const TaskDeadline = <T extends FieldValues>({ label, extra, ...rest }: TaskDeadlineProps<T>) => {
    const [showPicker, setShowPicker] = useState(false)
    return (
        <Controller
            {...rest}
            render={({ field: { onChange, value: deadline }, fieldState: { error } }) => {
                return (
                    <Card
                        className='justify-center items-center'
                        title={'Deadline'}
                        size='small'
                        bordered={false}
                        extra={
                            <Button type='primary' onClick={() => setShowPicker(!showPicker)}>
                                Change
                            </Button>
                        }
                    >
                        <Space className='w-100 justify-between align-center'>
                            <Statistic.Countdown value={dateFormat(deadline)} />
                            <DatePicker
                                onOpenChange={setShowPicker}
                                showNow={false}
                                inputRender={() => <></>}
                                open={showPicker}
                                onChange={onChange}
                                showTime
                                components={{ date: MyDatePanel }}
                            />
                        </Space>
                    </Card>
                )
            }}
        />
    )
}
const MyDatePanel = (props: {value?:Moment,onSelect: (value?:Moment)=>void}) => {
    const { value, onSelect } = props;

    // Value
    const startDate = React.useMemo(() => moment().date(1).month(0), []);
    const [innerValue, setInnerValue] = React.useState(value || startDate);
  
    React.useEffect(() => {
      if (value) {
        setInnerValue(value);
      }
    }, [value]);
  
    // Range
    const dateCount = React.useMemo(() => {
      const endDate = startDate.add(1, 'year').add(-1, 'day');
      return endDate.diff(startDate, 'day');
    }, [startDate]);
  
    const sliderValue = Math.min(Math.max(0, innerValue.diff(startDate, 'day')), dateCount);
  
    // Render
    return (
      <Flex vertical gap="small" style={{ padding: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }} title="no, it's not">
          The BEST Picker Panel
        </Typography.Title>
        <Slider
          min={0}
          max={dateCount}
          value={sliderValue}
          onChange={(nextValue) => {
            const nextDate = startDate.add(nextValue, 'day');
            setInnerValue(nextDate);
          }}
          tooltip={{
            formatter: (nextValue) => startDate.add(nextValue || 0, 'day').format('YYYY-MM-DD'),
          }}
        />
        <Button
          type="primary"
          onClick={() => {
            onSelect(innerValue);
          }}
        >{`That's It!`}</Button>
      </Flex>
    );
}