import React, { useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone } from '@fortawesome/free-solid-svg-icons/faMicrophone'
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons/faMicrophoneSlash'
import { Button } from 'antd'

export const Dictaphone = ({
    setText,
    setTempText,
    className,
}: {
    className?: string
    setText: (value: string) => void
    setTempText: (value: string) => void
}) => {
    const { transcript, listening, browserSupportsSpeechRecognition, finalTranscript } = useSpeechRecognition()
    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>
    }

    useEffect(() => {
        if (finalTranscript) {
            setText(finalTranscript)
            setTempText('')
        } else setTempText(transcript)
    }, [transcript])

    return (
        <Button
            className={`${listening ? 'mic-on' : 'mic-off'} ${className}`}
            onClick={() => {
                if (listening) {
                    SpeechRecognition.stopListening()
                } else {
                    SpeechRecognition.startListening().then()
                }
            }}
            icon={<FontAwesomeIcon icon={listening ? faMicrophone : faMicrophoneSlash} />}
        />
    )
}
