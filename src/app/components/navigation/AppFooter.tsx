import { useQuery } from 'react-query'
import { getShopData } from '../../axios/http/shopRequests'
import { Descriptions } from 'antd'
import DescriptionsItem from 'antd/es/descriptions/Item'
import AnchorLink from 'antd/es/anchor/AnchorLink'

export const AppFooter = () => {
    const { data: shop } = useQuery(['currentShop'], getShopData)
    return (
        <div className={'app-footer'}>
            <Descriptions layout='vertical' className={'w-100  p-2'}>
                <DescriptionsItem label={'Phone'} children={shop?.phone} />
                <DescriptionsItem label={'Address'} children={shop?.address} />
                <DescriptionsItem label={'Email'}>
                    <AnchorLink href={'mailto:' + shop?.email} title={shop?.email} />
                </DescriptionsItem>
            </Descriptions>
        </div>
    )
}
