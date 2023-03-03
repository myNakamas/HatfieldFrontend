import { IMessage } from "@stomp/stompjs/esm6";
import { stompClient } from "../websocketClient";

export const sendMessage = async (message: any) => {
    stompClient.publish({ destination: '/app/chat', body: JSON.stringify({ text: message }) })
}
export const registerToChat = (callBack: (message: IMessage) => void) => {
    stompClient.subscribe('/topic/chat', callBack)
}
