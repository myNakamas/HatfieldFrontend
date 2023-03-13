import { Client, IFrame } from '@stomp/stompjs'

const brokerURL = import.meta.env.VITE_API_WS_URL

const token = localStorage.getItem('token') ?? ''

export const stompClient = new Client()

export const connectToWebsocket = (onConnect: (frame: IFrame) => void) => {
    stompClient.configure({
        brokerURL,
        webSocketFactory: () => new WebSocket(brokerURL),
        connectHeaders: { Authorization: token },
        debug: () => {
            // console.log(msg)
        },
        onConnect,
    })
    stompClient.activate()
}
