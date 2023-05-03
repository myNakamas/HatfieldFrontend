import { Space } from 'antd/lib'
import { useQuery } from 'react-query'
import { getShopData } from '../axios/http/shopRequests'
import { Typography } from 'antd'

export const About = () => {
    const { data: shop } = useQuery(['currentShop'], getShopData)

    return (
        <Space className={'w-100'}>
            <Typography className='privacy-policy'>
                <div>
                    <Space>
                        <div>
                            <h2>About Us</h2>
                            <p>
                                We are a phone repair shop located in [insert physical address here]. We specialize in
                                repairing all types of mobile devices, including smartphones and tablets.
                            </p>

                            <h3>Our Services</h3>
                            <p>
                                Our experienced technicians can handle any type of phone repair, including screen
                                replacements, battery replacements, charging port repairs, and more. We use only
                                high-quality replacement parts and offer fast turnaround times to get your phone back to
                                you as quickly as possible.
                            </p>

                            <h3>Contact Us</h3>
                            <p>
                                If you have any questions or would like to schedule a repair, please feel free to
                                contact us using the following information:
                            </p>
                            <ul>
                                <li>
                                    Phone: <b>{shop?.phone}</b>
                                </li>
                                <li>
                                    Email: <b>{shop?.email}</b>
                                </li>
                                <li>
                                    Address: <b>{shop?.address}</b>
                                </li>
                            </ul>

                            <h3>Why Choose Us?</h3>
                            <ul>
                                <li>Experienced technicians</li>
                                <li>High-quality replacement parts</li>
                                <li>Fast turnaround times</li>
                                <li>Competitive pricing</li>
                                <li>Convenient location</li>
                            </ul>
                        </div>
                    </Space>

                    <h3>Our Mission</h3>
                    <p>
                        Our mission is to provide high-quality phone repair services at affordable prices. We believe in
                        delivering exceptional customer service and ensuring that our customers are satisfied with their
                        repair experience. We strive to be the go-to phone repair shop in our community and are
                        committed to building long-term relationships with our customers.
                    </p>
                </div>
            </Typography>
        </Space>
    )
}
