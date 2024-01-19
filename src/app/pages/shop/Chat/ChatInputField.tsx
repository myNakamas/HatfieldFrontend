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
import { Button, Input, Modal, Popover, Space, Upload, UploadFile, UploadProps, message } from 'antd'
import { getBase64, getCurrentTime } from '../../../utils/helperFunctions'
import { RcFile } from 'antd/es/upload'
import { Dictaphone } from '../../../components/form/Dictaphone'
import CheckableTag from 'antd/es/tag/CheckableTag'
import TextArea from 'antd/es/input/TextArea'
import { height } from '@fortawesome/free-solid-svg-icons/faHouse'

export const MessageInputField = ({ selectedTicket: ticket }: { selectedTicket?: Ticket }) => {
    const { loggedUser, isWorker } = useContext(AuthContext)
    const [showToClient, setShowToClient] = useState(false)
    const { addUnsentMessage, removeUnsentMessage } = useContext(WebSocketContext)
    const queryClient = useQueryClient()
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState('')
    const [previewTitle, setPreviewTitle] = useState('')
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [messageText, setMessageText] = useState('')
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile)
        }

        setPreviewImage(file.url || (file.preview as string))
        setPreviewOpen(true)
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1))
    }

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList)

    const send = (messageText: string) => {
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
                publicMessage: loggedUser.role === 'CLIENT' ? true : showToClient,
                randomId: randomId,
            }
            addUnsentMessage(message)
            sendMessage(message).then(() => {
                removeUnsentMessage({ status: 'Sent', ...message } as ChatMessage)
            })
        }
    }
    const sendPicture = () => {
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
            <Space.Compact className={'w-100'}>
                <Upload
                    listType='picture'
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
                        if (!file.type.startsWith('image')) {
                            message.error(`${file.name} is not an image`)
                            return Upload.LIST_IGNORE
                        }
                        setFileList([...fileList, file])
                        return false
                    }}
                    maxCount={1}
                    accept='image/*'
                >
                    {fileList.length == 0 && (
                        <Button
                            disabled={ticket?.id === undefined}
                            size={'large'}
                            icon={<FontAwesomeIcon icon={faFileUpload} />}
                        />
                    )}
                </Upload>
                <ChatInput
                    message={messageText}
                    onChange={setMessageText}
                    onSubmit={send}
                    disabled={ticket?.id === undefined}
                    hidden={fileList.length === 0}
                />
            </Space.Compact>
            <Button
                type='primary'
                size={'large'}
                disabled={!stompClient.connected || !ticket?.id}
                onClick={() => (fileList.length === 0 ? send(messageText) : sendPicture())}
                icon={<FontAwesomeIcon color='white' size='lg' icon={faPaperPlane} />}
            />
            {isWorker() && (
                <CheckableTag
                    style={{ marginLeft: 15 }}
                    checked={showToClient}
                    onChange={() => setShowToClient((prev) => !prev)}
                >
                    Send to client
                </CheckableTag>
            )}
        </div>
    )
}

const ChatInput = ({
    hidden,
    onSubmit,
    disabled,
    message,
    onChange,
}: {
    hidden: boolean
    onSubmit: (message: string) => void
    disabled: boolean
    message: string
    onChange: (value: string) => void
}) => {
    const [dictaphoneKey, setDictaphoneKey] = useState('')
    const [tempText, setTempText] = useState('')
    return (
        <>
            {hidden && (
                <>
                    <Popover content={tempText} open={!!tempText} autoAdjustOverflow>
                        <Dictaphone
                            disabled={disabled}
                            dictaphoneKey={'chat'}
                            setActiveDictaphone={setDictaphoneKey}
                            isActive={dictaphoneKey === 'chat'}
                            setText={(text) => onChange(message + ' ' + text)}
                            setTempText={setTempText}
                            size='large'
                        />
                    </Popover>

                    <TextArea
                        size='large'
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        value={message}
                        onChange={(e) => onChange(e.target.value)}
                        onPressEnter={(e) => {
                            e.preventDefault();
                            onSubmit(message)
                        }}
                        aria-autocomplete='none'
                        disabled={disabled}
                        autoFocus
                    />
                </>
            )}
        </>
    )
}
