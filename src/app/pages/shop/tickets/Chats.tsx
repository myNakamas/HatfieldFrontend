import { connectToWebsocket, stompClient } from "../../../axios/websocketClient";
import { useState } from "react";
import { Discuss } from "react-loader-spinner";
import { registerToChat, sendMessage } from "../../../axios/websocket/chat";

export const Chats = () => {
    const [connected, setConnected] = useState(false)
    const [loading, setLoading] = useState(false)

    const connect = async () => {
        setLoading(true)
        connectToWebsocket(() => {
            setLoading(false)
            setConnected(true)
            registerToChat((message) => {
                console.log('RECEIVED MESSAGE OMG:', message.body)
            })
        })
    }
    const send = async () => {
        await sendMessage('Custom message')
    }
    const closeConnection = () => {
        stompClient.deactivate().then()
    }

    return (
        <div className='mainScreen'>
            {loading && <Discuss />}
            <div className='flex'>
                <button className='actionButton' disabled={connected} onClick={connect}>
                    Connect
                </button>
                <button className='actionButton' disabled={!connected} onClick={send}>
                    Send message
                </button>
            </div>
        </div>
    )
}
