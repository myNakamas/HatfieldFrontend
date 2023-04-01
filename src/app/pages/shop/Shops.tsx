import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { useNavigate } from 'react-router-dom'
import { Shop } from '../../models/interfaces/shop'
import { CustomSuspense } from '../../components/CustomSuspense'
import { Button } from 'antd'

export const Shops = () => {
    const navigate = useNavigate()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const { data, isSuccess } = useQuery('shops', getAllShops)

    return (
        <div className='mainScreen'>
            <div className=' button-bar'>
                <Button onClick={() => setModalIsOpen(true)}>
                    Add a new Shop
                </Button>
            </div>
            <div className='tableWrapper'>
                <CustomSuspense isReady={isSuccess}>
                    {data && data.length > 0 ? (
                        <CustomTable<Shop>
                            data={data.map(({ id, shopName, email, address, phone, regNumber, vatNumber }) => ({
                                id,
                                shopName,
                                email,
                                address,
                                phone,
                                regNumber,
                                vatNumber,
                            }))}
                            onClick={({ id }) => navigate('/shops/' + id)}
                        />
                    ) : (
                        <NoDataComponent items='items in inventory' />
                    )}
                </CustomSuspense>
            </div>
        </div>
    )
}
