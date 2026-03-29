import { useQuery } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { getShopPublicData } from '../../axios/http/shopRequests'
import { WelwynHatfield } from './templates/WelwynHatfield/WelwynHatfield'
import { ShopContext } from '../../contexts/ShopContext'
import { Shop } from '../../models/interfaces/shop'

export const LandingPage = ({}: {}) => {
    const { shopName } = useParams()
    const navigate = useNavigate()
    if (!shopName) {
        navigate('/')
    }
    const { data: shop } = useQuery(['shops', shopName], () => getShopPublicData(shopName))
    const ShopTemplate = getShopTemplate(shop)

    return <ShopContext.Provider value={{ shop: shop! }}>{ShopTemplate}</ShopContext.Provider>
}
function getShopTemplate(shop: Shop | undefined) {
    return shop?.templates.templateName.toLocaleLowerCase() === `welwynhatfield` ? <WelwynHatfield /> : <></>
}
