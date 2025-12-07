import { Button } from 'antd'
import { Route, Routes } from 'react-router'
import { Shop } from '../../../../models/interfaces/shop'
import { Home } from './Home'
import NavBar from './NavBar'
import { Prices } from './Prices'

export const WelwynHatfield = ({ shop }: { shop: Shop }) => {
    return (
        <div className='hatfield'>
            <NavBar shop={shop} />
            <Routes>
                <Route path='/' element={<Home shop={shop} />} />
                <Route path='/prices' element={<Prices shop={shop}/>} />
                <Route path='/blog' element={'blog'} />
                <Route path='/accessories' element={'accessories'} />
                <Route path='/contact' element={'contact'} />
                <Route path='/faq' element={'faq'} />
                <Route path='/terms_and_conditions' element={'terms_and_conditions'} />
                <Route path='/privacy_policy' element={'privacy_policy'} />
                <Route path='/about_us' element={'about_us'} />
            </Routes>
            <Footer shop={shop} />
        </div>
    )
}

const Footer = ({ shop }: { shop: Shop }) => {
    return (
        <div className='footer'>
            <div className='links'>
                <Button type='text' size='large'>
                    FAQs
                </Button>
                <Button type='text' size='large'>
                    Terms and Conditions
                </Button>
                <Button type='text' size='large'>
                    Privacy Policy
                </Button>
                <Button type='text' size='large'>
                    About us
                </Button>
                <Button type='link' size='large'>
                    Check out our London located Shop!
                </Button>
            </div>
            <div className='copyright'>Copyright © {new Date().getFullYear()}</div>
        </div>
    )
}
