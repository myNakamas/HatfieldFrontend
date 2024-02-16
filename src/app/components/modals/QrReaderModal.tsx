import { AppModal } from './AppModal'
import { Button, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQrcode } from '@fortawesome/free-solid-svg-icons'
import { Html5QrcodeResult, Html5QrcodeScanner, QrcodeErrorCallback, QrcodeSuccessCallback } from 'html5-qrcode'
import { Html5QrcodeScannerConfig } from 'html5-qrcode/esm/html5-qrcode-scanner'

export const QrReaderModal = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const [result, setResult] = useState<URL>()

    const onNewScanResult = (decodedText: string) => {
        const result = new URL(decodedText)
        setResult(result)
    }

    return (
        <AppModal
            destroyOnClose
            isModalOpen={isModalOpen}
            closeModal={() => {
                closeModal()
            }}
            title={'Qr reader'}
        >
            <a href={result?.href} type={'link'}>
                {result?.href}
            </a>
            <Html5QrcodePlugin
                rememberLastUsedCamera
                fps={10}
                qrbox={250}
                disableFlip={false}
                showZoomSliderIfSupported
                showTorchButtonIfSupported
                useBarCodeDetectorIfSupported
                qrCodeSuccessCallback={onNewScanResult}
            />
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
            <Button
                icon={<FontAwesomeIcon icon={faQrcode} />}
                type={'dashed'}
                children={title}
                onClick={() => setModalOpen((prev) => !prev)}
            />
        </>
    )
}

const qrcodeRegionId = 'html5qr-code-full-region'

const Html5QrcodePlugin = ({
    verbose,
    qrCodeSuccessCallback,
    qrCodeErrorCallback,
    ...config
}: {
    verbose?: boolean
    qrCodeSuccessCallback: QrcodeSuccessCallback
    qrCodeErrorCallback?: QrcodeErrorCallback
} & Html5QrcodeScannerConfig) => {
    const navigate = useNavigate()

    const stopRendering = (scanner: Html5QrcodeScanner) => {
        if (scanner.getState() == 2) scanner.pause()
        scanner.clear().catch((error) => {
            console.error('Failed to clear html5QrcodeScanner. ', error)
        })
    }

    useEffect(() => {
        if (!qrCodeSuccessCallback) {
            throw 'qrCodeSuccessCallback is required callback.'
        }
        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose)
        const successCallback = (decodedText: string, result: Html5QrcodeResult) => {
            const url = new URL(decodedText)
            stopRendering(html5QrcodeScanner)
            navigate(`${url.pathname}?${url.searchParams}`)
            qrCodeSuccessCallback(decodedText, result)
        }
        html5QrcodeScanner.render(successCallback, qrCodeErrorCallback)
        // cleanup function when component will unmount
        return () => {
            stopRendering(html5QrcodeScanner)
        }
    }, [])

    return <div id={qrcodeRegionId} />
}
