import React, { useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone } from '@fortawesome/free-solid-svg-icons/faMicrophone'
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons/faMicrophoneSlash'
import { Button } from 'antd'
import { SizeType } from 'antd/es/config-provider/SizeContext'

export const Dictaphone = ({
    setText,
    setTempText,
    dictaphoneKey,
    setActiveDictaphone,
    isActive,
    ...props
}: {
    setText: (value: string) => void
    setTempText: (value: string) => void
    dictaphoneKey: string
    setActiveDictaphone: (value: string) => void
    isActive: boolean
    className?: string
    disabled?: boolean
    size?: SizeType
}) => {
    const { transcript, listening, browserSupportsSpeechRecognition, finalTranscript } = useSpeechRecognition()
    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>
    }

    useEffect(() => {
        if (isActive) {
            if (finalTranscript) {
                setText(finalTranscript)
                setTempText('')
            } else setTempText(transcript)
        }
    }, [transcript])

    return (
        <Button
            type={listening ? 'primary' : 'default'}
            onClick={() => {
                if (listening) {
                    SpeechRecognition.stopListening()
                    setActiveDictaphone('')
                } else {
                    setActiveDictaphone(dictaphoneKey)
                    SpeechRecognition.startListening().then()
                }
            }}
            icon={<FontAwesomeIcon icon={listening ? faMicrophone : faMicrophoneSlash} />}
            {...props}
        />
    )
}
