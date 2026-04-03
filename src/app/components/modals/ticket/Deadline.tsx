import { Statistic } from 'antd'
import dateFormat from 'dateformat'
import React from 'react'
import { StatisticProps } from 'antd/es/statistic/Statistic'
import dayjs from 'dayjs'

export const Deadline = ({ deadline, ...rest }: { deadline?: Date } & StatisticProps) => {
    return dayjs(deadline).isAfter(dayjs()) ? (
        <Statistic.Timer type='countdown' {...rest} title={dateFormat(deadline)} value={deadline?.valueOf()} />
    ) : (
        <Statistic {...rest} title={dateFormat(deadline)} value={'Passed'} />
    )
}
