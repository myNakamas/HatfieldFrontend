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
    disabled,
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
    const { transcript, listening, isMicrophoneAvailable, browserSupportsSpeechRecognition, finalTranscript } =
        useSpeechRecognition()
    useEffect(() => {
        if (isActive) setTempText(transcript)
    }, [transcript])

    useEffect(() => {
        if (isActive && finalTranscript) {
            setText(finalTranscript)
            setTempText('')
            setActiveDictaphone('')
        }
        return () => SpeechRecognition.abortListening()
    }, [finalTranscript])

    const buttonTitle = isMicrophoneAvailable
        ? browserSupportsSpeechRecognition
            ? 'Click to record'
            : "Browser doesn't support speech recognition."
        : 'Microphone not available'

    return (
        <Button
            type={listening ? 'primary' : 'default'}
            disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable || disabled}
            title={buttonTitle}
            onClick={() => {
                if (listening) {
                    SpeechRecognition.stopListening()
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
