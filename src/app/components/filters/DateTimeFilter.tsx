import { Filter } from '../../models/interfaces/filters'
import { useState } from 'react'
import moment, { Moment } from 'moment/moment'
import generatePicker from 'antd/es/date-picker/generatePicker'
import momentGenerateConfig from 'rc-picker/lib/generate/moment'

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

    const { RangePicker } = generatePicker<Moment>(momentGenerateConfig)
    const [dates, setDates] = useState<RangeValue<Moment>>([
        filter[after] ? moment(filter[after]) : null,
        filter[before] ? moment(filter[before]) : null,
    ])
    const updateFilter = (dates: any) => {
        setFilter({
            ...filter,
            [after]: dates?.at(0)?.format('YYYY-MM-DD') ?? null,
            [before]: dates?.at(1)?.format('YYYY-MM-DD') ?? null,
        })
    }

    return (
        <RangePicker
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