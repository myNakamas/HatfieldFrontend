import { RcFile } from 'antd/es/upload'
import { ChatMessage } from '../models/interfaces/ticket'
import moment from 'moment/moment'
import { User } from '../models/interfaces/user'
import { Page, PageRequest } from '../models/interfaces/generalModels'

export const capitalizeFirst = (str: string | undefined) => {
    return str?.substring(0, 1).toUpperCase().concat(str?.substring(1).toLowerCase())
}
export const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
export const sortChatByDate = (a: ChatMessage, b: ChatMessage) => +new Date(b.timestamp) - +new Date(a.timestamp)
// todo: replace all instances with this function
export const getCurrentTime = () => {
    return new Date().toISOString()
}
export const resetPageIfNoValues = <T>(
    pageResponse: Page<T>,
    setPage: (value: ((prevState: PageRequest) => PageRequest) | PageRequest) => void
) => {
    if (pageResponse.content.length == 0 && pageResponse.page > 1) setPage((oldVal) => ({ ...oldVal, page: 1 }))
}
export const generateDaysArray = (startDate?: string, endDate?: string): moment.Moment[] => {
    const start = moment(startDate).startOf('day') ?? moment().startOf('month').startOf('day')
    const end = moment(endDate).startOf('day')
    const daysArray = []

    while (start <= end) {
        daysArray.push(moment(start))
        start.add(1, 'days')
    }

    return daysArray
}

export const getUserString = (user: User) => {
    if (!!user?.fullName || !!user?.email || user?.phones?.length > 0)
        return [user?.fullName, user?.email,user?.phones ? user?.phones?.join(',') : ''].join(' ');
    return `Unknown user`
}

export const currencyFormat = (input?: number) => (input ? `${input?.toFixed(2)}£` : '-')
