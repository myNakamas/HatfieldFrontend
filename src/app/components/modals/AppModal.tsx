import React from 'react'
import { Modal } from 'antd'

export const AppModal = ({
    children,
    isModalOpen,
    closeModal,
    title,
}: {
    children: React.ReactNode
    isModalOpen: boolean
    closeModal: () => void
    title?: string
}) => {
    //todo: remove component and replace with the antd modal
    return (
        <Modal
            open={isModalOpen}
            onCancel={closeModal}
            closable
            title={title}
            width={'clamp(400px,80%,900px)'}
            footer={<></>}
        >
            {children}
        </Modal>
    )
}
