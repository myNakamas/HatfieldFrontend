import { Filter } from '../../models/interfaces/filters'
import DateTime from 'react-datetime'
import React from 'react'
import moment, { Moment } from 'moment/moment'

export const DateTimeFilter = ({
    filter,
    setFilter,
    placeholder,
}: {
    filter: Filter
    setFilter: (value: Filter) => void
    placeholder?: string
}) => {
    return (
        <div className='dateTimeFilter'>
            <div>
                From:
                <DateTime
                    value={filter.from}
                    timeFormat={false}
                    inputProps={placeholder ? { placeholder: placeholder + ' after' } : {}}
                    onChange={(value: Moment | string) => {
                        if (moment.isMoment(value)) setFilter({ ...filter, from: value.toISOString() })
                        else setFilter({ ...filter, from: '' })
                    }}
                    isValidDate={(currentDate) =>
                        currentDate <= new Date() && (filter.to ? currentDate <= new Date(filter.to) : true)
                    }
                />
            </div>
            <div>
                To:
                <DateTime
                    value={filter.to}
                    timeFormat={false}
                    inputProps={placeholder ? { placeholder: placeholder + ' before' } : {}}
                    onChange={(value) => {
                        if (moment.isMoment(value)) setFilter({ ...filter, to: value.toISOString() })
                        else setFilter({ ...filter, to: '' })
                    }}
                    isValidDate={(currentDate) =>
                        currentDate <= new Date() && (filter.from ? currentDate >= new Date(filter.from) : true)
                    }
                />
            </div>
        </div>
    )
}
