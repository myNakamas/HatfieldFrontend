import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Shop } from '../../../../models/interfaces/shop'
import {
    faDesktop,
    faGamepad,
    faLaptop,
    faMobile,
    faQuestion,
    faTablet,
} from '@fortawesome/free-solid-svg-icons'

interface PricesProps {
    shop: Shop
}
// todo: separate the mobile and desktop versions \
// of this page as they have different amount of steps
export const Prices = ({ shop }: PricesProps) => {
    return (
        <div className='prices'>
            <div className='container'>
                <SelectDevice />
                <div className='card'></div>
            </div>
        </div>
    )
}


const SelectDevice = () => {
    const choices = [
        {
            icon: <FontAwesomeIcon icon={faMobile} size='2xl' />,
            title: 'Smartphone',
        },
        {
            icon: <FontAwesomeIcon icon={faTablet} size='2xl' />,
            title: 'Tablet',
        },
        {
            icon: <FontAwesomeIcon icon={faLaptop} size='2xl' />,
            title: 'Laptop',
        },
        {
            icon: <FontAwesomeIcon icon={faDesktop} size='2xl' />,
            title: 'PC/Desktop',
        },
        {
            icon: <img src='/icons/electric_scooter.svg' alt='Electric scooter' />,
            title: 'Electric scooter',
        },
        {
            icon: <img src='/icons/playstation-brands-solid-full.svg' alt='PlayStation' />,
            title: 'PlayStation',
        },
        {
            icon: <img src='/icons/fa-brands--nintendo-switch.svg' alt='Nintendo switch' />,
            title: 'PlayStation',
        },
        {
            icon: <FontAwesomeIcon icon={faGamepad} size='2xl' />,
            title: 'Game console',
        },
        {
            icon: <FontAwesomeIcon icon={faQuestion} size='2xl' />,
            title: 'Other device',
        },
    ]
    return (
        <div className='card'>
            <h2>Select device type</h2>
            <span>Please select the type of your broken device</span>
            <div className='choice-grid'>
                {choices.map((choice, index) => (
                    <div key={index} className='choice-item'>
                        <div className='choice-icon'>{choice.icon}</div>
                        <span>{choice.title}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
