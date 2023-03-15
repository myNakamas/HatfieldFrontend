import { Filter } from '../../models/interfaces/generalModels'
import DateTime from 'react-datetime'
import React from 'react'

export const DateTimeFilter = ({ filter, setFilter }: { filter: Filter; setFilter: (value: Filter) => void }) => {
    return (
        <div className='dateTimeFilter'>
            <div>From:</div>
            <DateTime
                value={filter.from}
                timeFormat={false}
                onChange={(value) => {
                    setFilter({ ...filter, from: new Date(String(value)).toISOString() })
                }}
                isValidDate={(currentDate) =>
                    currentDate <= new Date() && (filter.to ? currentDate <= new Date(filter.to) : true)
                }
            />
            <div>To:</div>
            <DateTime
                value={filter.to}
                timeFormat={false}
                onChange={(value) => {
                    setFilter({ ...filter, to: new Date(String(value)).toISOString() })
                }}
                isValidDate={(currentDate) =>
                    currentDate <= new Date() && (filter.from ? currentDate >= new Date(filter.from) : true)
                }
            />
        </div>
    )
}
