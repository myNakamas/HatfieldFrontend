import React, { ReactNode, useState } from "react"
import { Shop } from "../models/interfaces/shop"
import { useQuery } from "react-query"
import { useParams, useNavigate } from "react-router-dom"
import { getShopPublicData } from "../axios/http/shopRequests"

export interface ShopContextData { 
    shop: Shop,
}
export const ShopContext: React.Context<ShopContextData> = React.createContext({} as ShopContextData)

export const ShopProvider = ({ children, shop }: { children: ReactNode, shop?:Shop }) => {
    const { shopName } = useParams()
    const navigate = useNavigate()
    if(!shopName){
        navigate('/')
    }
    
    if(!shop){ 
        return <></>
    }

    return (
        <ShopContext.Provider value={{ shop }}>
            {children}
        </ShopContext.Provider>
    )
}
