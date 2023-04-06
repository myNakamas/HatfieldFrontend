import React from 'react'
import { Modal } from 'antd'

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
}: {
    children: React.ReactNode
    isModalOpen: boolean
    closeModal: () => void
    title?: string
    size?: 'S' | 'M' | 'L'
}) => {
    return (
        <Modal
            open={isModalOpen}
            onCancel={closeModal}
            closable
            title={title}
            width={ModalSize[size ?? 'M']}
            footer={<></>}
        >
            {children}
        </Modal>
    )
}
