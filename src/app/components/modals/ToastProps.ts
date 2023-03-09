import { ToastOptions } from 'react-toastify'
import { capitalizeFirst } from '../../utils/helperFunctions'

export const toastProps = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored',
} as ToastOptions

export const toastCreatePromiseTemplate = (item: string) => {
    const itemLower = item.toLowerCase()
    return {
        pending: `Creating a new ${itemLower}, please wait`,
        success: `Successfully created a new ${itemLower}`,
        error: `${capitalizeFirst(itemLower)} creation failed`,
    }
}
