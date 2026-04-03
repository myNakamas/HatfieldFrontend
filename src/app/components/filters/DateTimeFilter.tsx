import { Filter } from '../../models/interfaces/filters'
import { useState } from 'react'
import {DatePicker} from 'antd'
import dayjs, { Dayjs } from 'dayjs'

export const DateTimeFilter = ({
    filter,
    setFilter,
    placeholder,
    dataKeys,
}: {
    filter: Filter
    setFilter: (value: Filter) => void
    placeholder?: string
    dataKeys?: { before: string; after: string }
}) => {
    const before = (dataKeys?.before as keyof Filter) ?? ('to' as keyof Filter)
    const after = (dataKeys?.after as keyof Filter) ?? ('from' as keyof Filter)

    const [dates, setDates] = useState<RangeValue<Dayjs>>([
        filter[after] ? dayjs(filter[after]) : null,
        filter[before] ? dayjs(filter[before]) : null,
    ])
    const updateFilter = (dates: any) => {
        setFilter({
            ...filter,
            [after]: dates?.at(0)?.format('YYYY-MM-DD') ?? null,
            [before]: dates?.at(1)?.format('YYYY-MM-DD') ?? null,
        })
    }

    return (
        <DatePicker.RangePicker
            placeholder={placeholder ? [placeholder + ' after', placeholder + ' before'] : undefined}
            allowEmpty={[true, true]}
            value={dates}
            onCalendarChange={(dates) => {
                setDates(dates)
                updateFilter(dates)
            }}
            onChange={(dates) => {
                setDates(dates)
                updateFilter(dates)
            }}
        />
    )
}

declare type EventValue<DateType> = DateType | null;
declare type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;