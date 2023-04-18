import { Filter } from '../../models/interfaces/filters'
import React, { useEffect, useState } from 'react'
import moment, { Moment } from 'moment/moment'
import { RangeValue } from 'rc-picker/lib/interface'
import generatePicker from 'antd/es/date-picker/generatePicker'
import momentGenerateConfig from 'rc-picker/lib/generate/moment'

export const DateTimeFilter = ({
    filter,
    setFilter,
    placeholder,
    dataKeys
}: {
    filter: Filter
    setFilter: (value: Filter) => void
    placeholder?: string
    dataKeys?: {before:string,after:string}
}) => {
    const before = dataKeys?.before as keyof Filter ?? 'to' as keyof Filter;
    const after = dataKeys?.after as keyof Filter ?? 'from' as keyof Filter;

    const { RangePicker } = generatePicker<Moment>(momentGenerateConfig)
    const [dates, setDates] = useState<RangeValue<Moment>>([
        filter[after] ? moment(filter[after]) : null,
        filter[before] ? moment(filter[before]) : null,
    ])

    useEffect(() => {
        setFilter({
            ...filter,
            [after]: dates?.at(0)?.format('YYYY-MM-DD') ?? undefined,
            [before]: dates?.at(1)?.format('YYYY-MM-DD') ?? undefined,
        })
    }, [dates])

    return (
        <div>
            <RangePicker
                size={'large'}
                placeholder={placeholder ? [placeholder + ' after', placeholder + ' before'] : undefined}
                allowEmpty={[true, true]}
                value={dates}
                onChange={setDates}
            />
        </div>
    )
}
