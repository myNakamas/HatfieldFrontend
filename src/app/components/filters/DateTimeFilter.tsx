import { Filter } from '../../models/interfaces/filters';
import DateTime from 'react-datetime';
import React from 'react';

export const DateTimeFilter = ({ filter, setFilter, placeholder }: { filter: Filter; setFilter: (value: Filter) => void, placeholder?:string }) => {
    return (
        <div className='dateTimeFilter'>
            <div>From:
            <DateTime
                value={filter.from}
                timeFormat={false}
                inputProps={placeholder ? {placeholder:placeholder+ ' after'} : {}}
                onChange={(value) => {
                    //todo: optimize and fix errors ( do not use new Date since on invalid date, it breaks)
                    setFilter({ ...filter, from: new Date(String(value)).toISOString() })
                }}
                isValidDate={(currentDate) =>
                    currentDate <= new Date() && (filter.to ? currentDate <= new Date(filter.to) : true)
                }
            /></div>
            <div>To:
            <DateTime
                value={filter.to}
                timeFormat={false}
                inputProps={placeholder ? {placeholder:placeholder+ ' before'} : {}}
                onChange={(value) => {
                    setFilter({ ...filter, to: new Date(String(value)).toISOString() })
                }}
                isValidDate={(currentDate) =>
                    currentDate <= new Date() && (filter.from ? currentDate >= new Date(filter.from) : true)
                }
            /></div>
        </div>
    )
}
