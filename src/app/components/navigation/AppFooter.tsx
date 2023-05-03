import { Button, Descriptions } from 'antd'
import DescriptionsItem from 'antd/es/descriptions/Item'
import { useNavigate } from 'react-router-dom'

export const AppFooter = () => {
    const navigate = useNavigate()
    return (
        <div className={'app-footer'}>
            <Descriptions className={'w-100  p-2'}>
                <DescriptionsItem label={'About'}>
                    <Button type={'link'} onClick={() => navigate('/privacy')}>
                        Privacy Policy
                    </Button>
                    <Button type={'link'} onClick={() => navigate('/about')}>
                        About us
                    </Button>
                </DescriptionsItem>
            </Descriptions>
        </div>
    )
}
