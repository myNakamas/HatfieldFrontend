import { Button } from 'antd'
import { useContext } from 'react'
import { Route, Routes, useNavigate } from 'react-router'
import { ShopContext } from '../../../../contexts/ShopContext'
import { Home } from './Home'
import Terms from './legal/Terms'
import NavBar from './NavBar'
import { Prices } from './Prices'
import { HatfieldPolicy } from './legal/HatfieldPolicy'
import { FAQ } from './legal/FAQ'

export const WelwynHatfield = () => {
    return (
        <div className='hatfield'>
            <NavBar />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/prices' element={<Prices />} />
                <Route path='/blog' element={'blog'} />
                <Route path='/accessories' element={'accessories'} />
                <Route path='/contact' element={'contact'} />
                <Route path='/faq' element={<FAQ/>} />
                <Route path='/terms_and_conditions' element={<Terms />} />
                <Route path='/privacy_policy' element={<HatfieldPolicy />} />
                <Route path='/about_us' element={'about_us'} />
            </Routes>
            <Footer />
        </div>
    )
}

const Footer = () => {
    useContext(ShopContext)
    const navigate = useNavigate()
    return (
        <div className='footer'>
            <div className='links'>
                <Button type='text' size='large' onClick={() => navigate('faq')}>
                    FAQs
                </Button>
                <Button type='text' size='large' onClick={() => navigate('terms_and_conditions')}>
                    Terms and Conditions
                </Button>
                <Button type='text' size='large' onClick={() => navigate('privacy_policy')}>
                    Privacy Policy
                </Button>
                <Button type='text' size='large' onClick={() => navigate('about_us')}>
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
