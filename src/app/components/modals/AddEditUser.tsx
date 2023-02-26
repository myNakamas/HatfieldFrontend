import { AppModal } from "./AppModal";

export const AddEditUser = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    return <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
        <div></div>
    </AppModal>
}
