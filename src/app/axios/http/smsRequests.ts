import axios from 'axios'

export interface SmsBalanceResponse {
    data: { balance: number; sms_count: string }
}
export const sendSmsApiBalanceCheck = (token: string) => {
    return axios.get('https://api.d7networks.com/messages/v1/balance', {
        headers: { Authorization: `Bearer ${token}` },
    })
}
