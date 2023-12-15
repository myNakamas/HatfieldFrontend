import { useQuery } from 'react-query'
import { getShopData } from '../../axios/http/shopRequests'
import { App, ModalFuncProps } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint } from '@fortawesome/free-solid-svg-icons'

export const usePrintConfirm = (): { printConfirm: (props: ModalFuncProps) => void } => {
    const { data: shop } = useQuery(['currentShop'], getShopData)
    const { modal } = App.useApp()
    if (!shop?.shopSettingsView.printEnabled) return { printConfirm: () => {} }
    return {
        printConfirm: (props) =>
            modal.confirm({ ...props, okText: 'Print', closable: true, icon: <FontAwesomeIcon icon={faPrint} /> }),
    }
}
