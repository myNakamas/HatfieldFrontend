import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { CustomTable } from '../../components/table/CustomTable'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { useNavigate } from 'react-router-dom'
import { Shop } from '../../models/interfaces/shop'
import { CustomSuspense } from '../../components/CustomSuspense'
import { Button, Space } from 'antd'
import { AddShop } from '../../components/modals/AddShop'

export const Shops = () => {
    const navigate = useNavigate()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const { data, isSuccess } = useQuery('shops', getAllShops)

    return (
        <div className='mainScreen'>
            <AddShop isModalOpen={modalIsOpen} closeModal={() => setModalIsOpen(false)} />
            <Space className=' button-bar'>
                <Button onClick={() => setModalIsOpen(true)}>Add a new Shop</Button>
            </Space>
            <div>
                <CustomSuspense isReady={isSuccess}>
                    {data && data.length > 0 ? (
                        <CustomTable<Shop>
                            data={data}
                            headers={{
                                shopName: 'Shop Name',
                                email: 'email',
                                address: 'Shop address',
                                phone: 'phone',
                                regNumber: 'Registration number',
                                vatNumber: 'VAT Number',
                            }}
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
