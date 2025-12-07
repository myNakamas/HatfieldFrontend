import {
    faMobileAlt,
    faTabletAlt,
    faDesktop,
    faLaptop,
    faChargingStation,
    faGamepad,
    faDollarSign,
    faPhone,
    faClock,
    faHandHoldingDollar,
    faMedal,
    faUsers,
    faHandshake,
    faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Shop } from '../../../../models/interfaces/shop'

interface HomeProps {
    shop: Shop
}

export const Home = ({ shop }: HomeProps) => {
    return (
        <div>
            <div className='cover'>
                <div className='coverImage'>
                    <div className='gradient' />
                </div>
                <Heading shop={shop} />
            </div>
            <WhyChooseUs />
        </div>
    )
}
const Heading = ({ shop }: { shop: Shop }) => {
    return (
        <div className='heading'>
            <h1 className='shop-header__title'>{shop.shopName}</h1>
            <p className='shop-header__tagline'>Your one stop solution</p>
            <h2 className='shop-header__section-title'>Expert repairs for</h2>

            <div className='shop-header__services'>
                <div className='shop-header__services-item'>
                    <div className='icon'>
                        <FontAwesomeIcon icon={faMobileAlt} />
                    </div>
                    <div className='label'>Smartphones</div>
                </div>
                <div className='shop-header__services-item'>
                    <div className='icon'>
                        <FontAwesomeIcon icon={faTabletAlt} />
                    </div>
                    <div className='label'>Tablets</div>
                </div>
                <div className='shop-header__services-item'>
                    <div className='icon'>
                        <FontAwesomeIcon icon={faDesktop} />
                    </div>
                    <div className='label'>PC</div>
                </div>

                <div className='shop-header__services-item'>
                    <div className='icon'>
                        <FontAwesomeIcon icon={faLaptop} />
                    </div>
                    <div className='label'>Laptops</div>
                </div>

                <div className='shop-header__services-item'>
                    <div className='icon'>
                        <FontAwesomeIcon icon={faChargingStation} />
                    </div>
                    <div className='label'>Electric Scooters</div>
                </div>

                <div className='shop-header__services-item'>
                    <img className='icon' src='/icons/playstation-brands-solid-full.svg' alt='PlayStation' />
                    <div className='label'>PlayStation</div>
                </div>

                <div className='shop-header__services-item'>
                    <img className='icon' src='/icons/fa-brands--nintendo-switch.svg' alt='Nintendo switch' />
                    <div className='label'>Nintendo Switch</div>
                </div>

                <div className='shop-header__services-item'>
                    <div className='icon'>
                        <FontAwesomeIcon icon={faGamepad} />
                    </div>
                    <div className='label'>Gaming Consoles</div>
                </div>
            </div>
            <p className='shop-header__sub-title'>Fast. Reliable. Using only quality parts.</p>
            <section className='we-also-section'>
                <div className='we-also-content'>
                    <h2 className='we-also-title'>We also:</h2>
                    <ul className='we-also-list'>
                        <li>Sell vapes</li>
                        <li>Buy and sell phones</li>
                        <li>Sell phone accessories</li>
                        <li>Sell smoking accessories</li>
                    </ul>
                    <div className='we-also-cta'>
                        <div className='cta-button'>
                            <FontAwesomeIcon icon={faDollarSign} className='cta-icon' size='xl' />
                            <span className='cta-text'>Find the price of your repair here!</span>
                        </div>

                        <div className='cta-button'>
                            <FontAwesomeIcon icon={faPhone} className='cta-icon' size='xl' />
                            <span className='cta-text'>Or directly call us!</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

const WhyChooseUs = () => {
    const reasons = [
        {
            icon: <FontAwesomeIcon icon={faClock} size='xl' />,
            title: 'Quick Repair Process',
            text: 'We understand the importance of your mobile device in your life and the value of your time, therefore we provide while you wait repairs service. We are also PayPal verified for online payments.',
        },
        {
            icon: (
                <>
                    <FontAwesomeIcon icon={faHandHoldingDollar} size='xl' />
                    <FontAwesomeIcon icon={faMedal} size='xl' />
                </>
            ),
            title: 'Low Price Guarantee + Quality Parts',
            text: 'We strive to use quality parts and maintain low prices by avoiding re-sellers and monitoring local requirements.',
        },
        {
            icon: <img src='/icons/replace_monitor.svg' alt='Screen replacement icon' />,
            title: 'Proof of quality work',
            text: 'In the last month we have fixed 674 devices.',
        },
        {
            icon: <FontAwesomeIcon icon={faUsers} size='xl' />,
            title: 'Trained & Certified Team',
            text: 'We have trained & certified our engineering team to handle any types of technical difficulties for the mainstream devices on the market.',
        },
        {
            icon: <FontAwesomeIcon icon={faHandshake} size='xl' />,
            title: 'Reliable & Secure',
            text: 'We understand the value of your personal data and we make sure nothing is lost during the repair process.',
        },
        {
            icon: <FontAwesomeIcon icon={faFileInvoiceDollar} size='xl' />,
            title: '30 Days Warranty',
            text: 'We provide 30 days Warranty for any part replaced by our company.',
        },
    ]

    return (
        <section className='why-choose-us'>
            <div className='container'>
                <h2 className='section-title'>
                    Why Choose Us
                    <div className='underline' />
                </h2>

                <div className='reasons-grid'>
                    {reasons.map((reason, index) => (
                        <div key={index} className='reason-card'>
                            <div className='reason-icon'>{reason.icon}</div>
                            <h3 className='reason-title'>{reason.title}</h3>
                            <p className='reason-text'>
                                {reason.text.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i < reason.text.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
