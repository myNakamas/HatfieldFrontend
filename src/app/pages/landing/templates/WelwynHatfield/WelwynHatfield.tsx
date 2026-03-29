import { Button } from 'antd'
import React, { useContext } from 'react'
import { Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router'
import { ShopContext } from '../../../../contexts/ShopContext'
import PriceResult from '../../PriceResult'
import { ContactUs } from './ContactUs'
import { Home } from './Home'
import NavBar from './NavBar'
import { Prices } from './Prices'
import { AboutUs } from './footer/AboutUs'
import { FAQ } from './footer/FAQ'
import { HatfieldPolicy } from './footer/HatfieldPolicy'
import Terms from './footer/Terms'

export const WelwynHatfield = () => {
    const location = useLocation()
    const navigationType = useNavigationType() // "POP" | "PUSH" | "REPLACE"

    React.useEffect(() => {
        console.log('The current URL is', { ...location })
        console.log('The last navigation action was', navigationType)
    }, [location, navigationType])

    return (
        <div className='hatfield'>
            <NavBar />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/prices' element={<Prices />} />
                <Route path='/prices/result' element={<PriceResult />} />
                <Route path='/blog' element={'blog'} />
                <Route path='/accessories' element={'accessories'} />
                <Route path='/contact' element={<ContactUs />} />
                <Route path='/faq' element={<FAQ />} />
                <Route path='/terms_and_conditions' element={<Terms />} />
                <Route path='/privacy_policy' element={<HatfieldPolicy />} />
                <Route path='/about_us' element={<AboutUs />} />
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
