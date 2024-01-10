import React from 'react'
import { Modal, ModalProps } from 'antd'
import { ModalStaticFunctions } from 'antd/es/modal/confirm'

const ModalSize = {
    S: 'clamp(400px,70%,500px)',
    M: 'clamp(400px,80%,900px)',
    L: 'clamp(400px,90%,1300px)',
}

export const AppModal = ({
    children,
    isModalOpen,
    closeModal,
    title,
    size,
    isForbidden,
    ...modalProps
}: {
    children: React.ReactNode
    isModalOpen: boolean
    closeModal: () => void
    title?: string
    size?: 'S' | 'M' | 'L'
    isForbidden?: boolean
} & ModalProps) => {
    if (isForbidden) return <></>
    return (
        <Modal
            open={isModalOpen}
            onCancel={closeModal}
            closable
            title={title}
            width={ModalSize[size ?? 'M']}
            footer={<></>}
            {...modalProps}
        >
            {children}
        </Modal>
    )
}
