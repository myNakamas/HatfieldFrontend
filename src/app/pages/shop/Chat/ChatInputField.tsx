import { stompClient } from '../../../axios/websocketClient'
import React, { useContext, useState } from 'react'
import { sendMessage, uploadPicture } from '../../../axios/websocket/chat'
import { ChatMessage, CreateChatMessage, Ticket } from '../../../models/interfaces/ticket'
import { AuthContext } from '../../../contexts/AuthContext'
import { useQueryClient } from 'react-query'
import { WebSocketContext } from '../../../contexts/WebSocketContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane'
import { faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { Button, Checkbox, Modal, Upload, UploadFile, UploadProps } from 'antd'
import { getBase64, getCurrentTime } from '../../../utils/helperFunctions'
import { RcFile } from 'antd/es/upload'

export const MessageInputField = ({ selectedTicket: ticket }: { selectedTicket?: Ticket }) => {
    const { loggedUser } = useContext(AuthContext)
    const [messageText, setMessageText] = useState('')
    const [showToClient, setShowToClient] = useState(true)
    const { addUnsentMessage, removeUnsentMessage } = useContext(WebSocketContext)
    const queryClient = useQueryClient()
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState('')
    const [previewTitle, setPreviewTitle] = useState('')
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile)
        }

        setPreviewImage(file.url || (file.preview as string))
        setPreviewOpen(true)
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1))
    }

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList)

    const send = () => {
        if (loggedUser && ticket && messageText.trim().length > 0) {
            const randomId = Math.floor(Math.random() * 1000000)
            const receiver =
                loggedUser.userId !== ticket?.client?.userId ? ticket?.client?.userId : ticket.createdBy.userId
            setMessageText('')
            const message: CreateChatMessage = {
                timestamp: getCurrentTime(),
                sender: loggedUser.userId,
                text: messageText,
                ticketId: ticket.id,
                receiver,
                publicMessage: showToClient,
                randomId: randomId,
            }
            addUnsentMessage(message)
            sendMessage(message).then(() => {
                removeUnsentMessage({ status: 'Sent', ...message } as ChatMessage)
            })
        }
    }
    const sendPicture = () => {
        console.log('sending picture:', fileList)
        uploadPicture(fileList, ticket?.id, showToClient).then(() => {
            queryClient.invalidateQueries(['messages', ticket?.id]).then(() => {
                setPreviewOpen(false)
                setFileList([])
            })
        })
    }
    return (
        <div className='messageField'>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt='example' style={{ width: '100%' }} src={previewImage} />
            </Modal>
            <Upload
                className='upload-list-inline'
                listType='text'
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                onRemove={(file) => {
                    const index = fileList.indexOf(file)
                    const newFileList = fileList.slice()
                    newFileList.splice(index, 1)
                    setFileList(newFileList)
                }}
                beforeUpload={(file) => {
                    setFileList([...fileList, file])

                    return false
                }}
            >
                <Button icon={<FontAwesomeIcon icon={faFileUpload} />} />
            </Upload>
            {fileList.length === 0 && (
                <input
                    className='input'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    aria-autocomplete='none'
                    disabled={ticket?.id === undefined}
                    autoFocus
                />
            )}
            {/*todo: hide from the client*/}
            Send to client: <Checkbox checked={showToClient} onChange={() => setShowToClient((prev) => !prev)} />
            <Button
                type='primary'
                className={`sendButton`}
                disabled={!stompClient.connected || !ticket?.id}
                onClick={fileList.length === 0 ? send : sendPicture}
                icon={<FontAwesomeIcon color='white' size='lg' icon={faPaperPlane} />}
            />
        </div>
    )
}
