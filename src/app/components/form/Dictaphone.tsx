import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons/faMicrophone';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons/faMicrophoneSlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export interface DictaphoneRef {
    reset: () => void;
}

export const Dictaphone = forwardRef<DictaphoneRef, {
    setText: (value: string) => void;
    setTempText: (value: string) => void;
    dictaphoneKey: string;
    setActiveDictaphone: (value: string) => void;
    isActive: boolean;
    className?: string;
    disabled?: boolean;
    size?: SizeType;
}>(({
    setText,
    setTempText,
    dictaphoneKey,
    setActiveDictaphone,
    isActive,
    disabled,
    size,
    ...props
}, ref) => {
    const {
        transcript,
        listening,
        isMicrophoneAvailable,
        browserSupportsSpeechRecognition,
        finalTranscript,
        resetTranscript,
    } = useSpeechRecognition();

    // Expose reset to parent via ref (useful when inside forms)
    useImperativeHandle(ref, () => ({
        reset: resetTranscript,
    }), [resetTranscript]);

    // Live preview while speaking
    useEffect(() => {
        if (isActive) {
            setTempText(transcript);
        }
    }, [transcript, isActive, setTempText]);

    // When final transcript arrives → save it and stop
    useEffect(() => {
        if (isActive && finalTranscript) {
            setText(finalTranscript);
            setTempText('');
            setActiveDictaphone('');
            // Optional: reset transcript after finalizing
            resetTranscript();
        }
    }, [finalTranscript, isActive, setText, setTempText, setActiveDictaphone, resetTranscript]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            SpeechRecognition.abortListening();
        };
    }, []);

    const buttonTitle = isMicrophoneAvailable
        ? browserSupportsSpeechRecognition
            ? 'Click to record'
            : "Browser doesn't support speech recognition."
        : 'Microphone not available';

    return (
        <Button
            type={listening ? 'primary' : 'default'}
            disabled={!browserSupportsSpeechRecognition || !isMicrophoneAvailable || disabled}
            title={buttonTitle}
            size={size}
            onClick={() => {
                if (listening) {
                    SpeechRecognition.stopListening();
                } else {
                    setActiveDictaphone(dictaphoneKey);
                    SpeechRecognition.startListening({ continuous: true, language: 'en-GB' });
                }
            }}
            icon={
                <FontAwesomeIcon 
                    icon={listening ? faMicrophone : faMicrophoneSlash} 
                />
            }
            {...props}
        />
    );
});

Dictaphone.displayName = 'Dictaphone';