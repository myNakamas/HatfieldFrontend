import { useQuery } from 'react-query'
import { getShopData } from '../axios/http/shopRequests'
import { Typography } from 'antd'
import ReactMarkdown from 'react-markdown'

export const About = () => {
    const { data: shop } = useQuery(['currentShop'], getShopData)

    return (
        <div className={'mainScreen'}>
            <Typography className='privacy-policy'>
                <div>{shop?.templates.aboutPage && <ReactMarkdown children={shop?.templates.aboutPage} />}</div>
            </Typography>
        </div>
    )
}
