import { useQuery, useQueryClient } from "react-query"
import { useNavigate, useParams } from "react-router-dom"
import { getShopPublicData } from "../../axios/http/shopRequests"
import { WelwynHatfield } from "./templates/WelwynHatfield/WelwynHatfield"

export const LandingPage = ({}:{}) => {
    const { shopName } = useParams()
    const navigate = useNavigate()
    if(!shopName){
        navigate('/')
    }
    const { data: shop } = useQuery(['shops', shopName], ()=>getShopPublicData(shopName))
    if(shop?.templates.templateName.toLocaleLowerCase() === `welwynhatfield`) 
        return <WelwynHatfield shop={shop}/>

    return <>Landing page</>
}
