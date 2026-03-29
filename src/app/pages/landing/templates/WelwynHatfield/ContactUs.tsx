import { Typography } from 'antd'

export const ContactUs = () => {
    return (
        <div className='contact-us-page'>
            <div className='container'>
                <h1>Contact Us</h1>
                <div className='content'>
                    <div className='shop-details'>
                        <Typography.Title level={5}>Welwyn Hatfield Mobile Store</Typography.Title>
                        <p>
                            27 Town Centre
                            <br />
                            Hatfield AL10 0JT
                            <br />
                            The yellow phone shop
                            <br />
                            Opposite Simmons Bakers
                        </p>
                        <div className='working-hours'>
                            <strong>Working Days & Hours</strong>
                            <div>
                                Mon - Sat : 09:00 AM - 07:00 PM
                                <br />
                                Sun : 10:00 AM - 04:30 PM
                            </div>
                        </div>
                    </div>
                    <div className='map-container'>
                        <iframe
                            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d185.88443863221477!2d-0.22641601476054127!3d51.76322361731732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48763c835bb108d9%3A0x8b3dcc2928e30b4f!2sMobile%20Phone%20%26%20Computer%20Repair%20Shop%20%7C%20Welwyn%20Hatfield!5e1!3m2!1sen!2sbg!4v1774803077104!5m2!1sen!2sbg'
                            width='100%'
                            height='450'
                            style={{ border: 0 }}
                            allowFullScreen
                            loading='lazy'
                            title='Shop Location'
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    )
}
