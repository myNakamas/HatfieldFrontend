import React from "react";
import ReactModal from "react-modal";
import { ModalStyles } from "../../styles/components/stylesTS";

export const AppModal = ({children,isModalOpen,closeModal}:{children:React.ReactNode ,isModalOpen: boolean; closeModal: () => void})=> {
  return <ReactModal closeTimeoutMS={200} style={ModalStyles()} isOpen={isModalOpen} onRequestClose={closeModal} contentLabel='Add inventory item'>
    {children}
  </ReactModal>
}
