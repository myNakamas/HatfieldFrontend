import moment from 'moment/moment'
import { Statistic } from 'antd'
import dateFormat from 'dateformat'
import React from 'react'
import { StatisticProps } from 'antd/es/statistic/Statistic'

export const Deadline = ({ deadline, ...rest }: { deadline?: Date } & StatisticProps) => {
    return moment(deadline) > moment() ? (
        <Statistic.Countdown {...rest} title={dateFormat(deadline)} value={deadline?.valueOf()} />
    ) : (
        <Statistic {...rest} title={dateFormat(deadline)} value={'Passed'} />
    )
}
