import { connectToWebsocket, stompClient } from '../../../axios/websocketClient'
import { useState } from 'react'
import { Discuss } from 'react-loader-spinner'
import { registerToChat, sendMessage } from '../../../axios/websocket/chat'

export const Chats = () => {
    const [messages, setMessages] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [messageText, setMessageText] = useState('...')

    const connect = async () => {
        setLoading(true)
        connectToWebsocket(() => {
            setLoading(false)
            registerToChat((message) => {
                console.log('RECEIVED MESSAGE :', message.body)
                setMessages((prev) => [...prev, message.body])
            })
        })
    }
    const send = async () => {
        await sendMessage(messageText)
    }
    const closeConnection = () => {
        stompClient.deactivate().then()
    }

    return (
        <div className='mainScreen'>
            {loading && <Discuss />}
            <div className='flex-100'>
                <button className='actionButton' disabled={stompClient.connected} onClick={connect}>
                    Connect
                </button>
                <button className='actionButton' disabled={!stompClient.connected} onClick={send}>
                    Send message
                </button>
                <button className='actionButton' disabled={!stompClient.connected} onClick={closeConnection}>
                    Disconnect
                </button>
            </div>
            <input value={messageText} onChange={(e) => setMessageText(e.target.value)} />
            {messages.map((value, index) => (
                <div key={index}>{value}</div>
            ))}
        </div>
    )
}
