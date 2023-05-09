import { Space } from 'antd/lib'
import AnchorLink from 'antd/es/anchor/AnchorLink'
import { useQuery } from 'react-query'
import { getShopData } from '../axios/http/shopRequests'
import { Typography } from 'antd'

export const Privacy = () => {
    const { data: shop } = useQuery(['currentShop'], getShopData)

    return (
        <Space className={'w-100'}>
            <Typography className='privacy-policy'>
                <h2>Privacy Policy</h2>
                <p>
                    We respect your privacy and are committed to protecting your personal data. This privacy policy will
                    inform you how we collect, use, and process your personal data.
                </p>

                <h3>1. What personal data do we collect?</h3>
                <p>We collect the following personal data from our customers:</p>
                <ul>
                    <li>Full name</li>
                    <li>Phone number(s)</li>
                    <li>Email address</li>
                </ul>

                <h3>2. How do we use your personal data?</h3>
                <p>We use your personal data for the following purposes:</p>
                <ul>
                    <li>To communicate with you about your phone repair status.</li>
                    <li>To send you notifications regarding your phone repair.</li>
                    <li>To send you updates on our services and promotions (with your explicit consent).</li>
                    <li>To comply with our legal and regulatory obligations.</li>
                </ul>

                <h3>3. How do we protect your personal data?</h3>
                <p>
                    We take the security of your personal data seriously and have implemented appropriate technical and
                    organizational measures to protect your personal data from unauthorized access, use, disclosure,
                    alteration, or destruction.
                </p>

                <h3>4. How long do we keep your personal data?</h3>
                <p>
                    We will retain your personal data for as long as necessary to fulfill the purposes for which it was
                    collected or as required by law.
                </p>

                <h3>5. Your rights</h3>
                <p>Under the General Data Protection Regulation (GDPR), you have the following rights:</p>
                <ul>
                    <li>The right to access your personal data</li>
                    <li>The right to rectify your personal data</li>
                    <li>The right to erase your personal data</li>
                    <li>The right to restrict the processing of your personal data</li>
                    <li>The right to object to the processing of your personal data</li>
                    <li>The right to data portability</li>
                </ul>
                <p>To exercise your rights, please contact us using the contact details provided below.</p>

                <h3>6. Contact Us</h3>
                <p>
                    If you have any questions or concerns about this privacy policy, please contact us at{' '}
                    <AnchorLink className='inline' href={'mailto:' + shop?.email} title={shop?.email} />.
                </p>
            </Typography>
        </Space>
    )
}
