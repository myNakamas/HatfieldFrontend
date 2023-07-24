import { AppModal } from './AppModal'
import QrScanner from 'qr-scanner'
import { Button } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const QrReaderModal = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const navigate = useNavigate()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [result, setResult] = useState<URL>()
    const qrScanner = useRef<QrScanner | null>(null) // Ref to store the qrScanner instance

    useEffect(() => {
        if (videoRef.current) {
            const scanner = new QrScanner(
                videoRef.current,
                ({ data }) => {
                    setResult(new URL(data))
                    if (result?.host === window.location.hostname) {
                        navigate(`${result.pathname}?${result.searchParams}`)
                    }
                },
                { highlightCodeOutline: true, preferredCamera: 'environment' }
            )
            scanner.start().then()
            return () => {
                scanner.stop()
            }
        }
    }, [isModalOpen])

    return (
        <AppModal
            isModalOpen={isModalOpen}
            closeModal={() => {
                qrScanner.current?.stop()
                closeModal()
            }}
            title={'Qr reader'}
        >
            <video width={'100%'} height={'100%'} ref={videoRef} />
            Qr value:{' '}
            <Button
                onClick={() => {
                    result && navigate(`${result.pathname}?${result.searchParams}`)
                }}
                type={'link'}
            >
                {result?.href}
            </Button>
        </AppModal>
    )
}

export const QrReaderButton = ({ title, hidden }: { title: string; hidden?: boolean }) => {
    const [modalOpen, setModalOpen] = useState(false)
    return hidden ? (
        <></>
    ) : (
        <>
            <QrReaderModal isModalOpen={modalOpen} closeModal={() => setModalOpen(false)} />
            <Button type={'primary'} children={title} onClick={() => setModalOpen((prev) => !prev)} />
        </>
    )
}
