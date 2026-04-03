import { faArrowLeft, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Card, ConfigProvider, Progress, Spin, theme, Typography } from 'antd'
import { useContext } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { pricingApi } from '../../axios/http/pricingRequests'
import { ShopContext } from '../../contexts/ShopContext'
import { PricingEvaluation, Shop } from '../../models/interfaces/shop'
import { currencyFormat } from '../../utils/helperFunctions'

export default function PriceResult(): React.JSX.Element {
    const searchParams = new URLSearchParams(window.location.search)

    const deviceType = searchParams.get('deviceType') || ''
    const brand = searchParams.get('brand') || ''
    const model = searchParams.get('model') || ''
    const issue = searchParams.get('issue') || ''
    const { shop } = useContext(ShopContext)
    const navigate = useNavigate()

    if (!deviceType || !model || !issue) {
        return (
            <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
                <div className='price-result-page'>
                    <Card className='result-card'>
                        <Typography.Title level={4} type='danger'>
                            Invalid Parameters
                        </Typography.Title>
                        <p>Please go back and provide all necessary information (Device Type, Model, and Issue).</p>
                    </Card>
                </div>
            </ConfigProvider>
        )
    }

    const { data, isLoading } = useQuery<PricingEvaluation>({
        queryKey: ['price', deviceType, brand, model, issue],
        queryFn: () => pricingApi.evaluate(deviceType, brand, model, issue),
        staleTime: 10 * 60 * 1000,
    })

    return (
        <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
            <div className='price-result-page'>
                <Card className='result-card'>
                    <div className='result-header'>
                        <div className='flex justify-between items-center'>
                            <div className='flex'>
                                <Button
                                    type='primary'
                                    onClick={() => navigate(-1)}
                                    icon={<FontAwesomeIcon icon={faArrowLeft} />}
                                    className='button'
                                />
                                <h2>Price evaluation</h2>
                            </div>
                            <span>Done</span>
                        </div>
                        <Progress strokeColor='#52c41a' percent={100} showInfo={false} className='progress-bar' />
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className='loading-container'>
                            <Spin size='large' />
                            <p>Calculating best price for your repair...</p>
                        </div>
                    ) : data?.priceExists ? (
                        <PriceResultDetails data={data} brand={brand} model={model} issue={issue} shop={shop} />
                    ) : (
                        <NoPriceResultDetails brand={brand} model={model} issue={issue} shop={shop} />
                    )}
                </Card>
            </div>
        </ConfigProvider>
    )
}

/* ==================== Result Details ==================== */

interface PriceResultDetailsProps {
    data: PricingEvaluation
    shop: Shop
    brand: string
    model: string
    issue: string
}

const PriceResultDetails = ({ data, shop, brand, model, issue }: PriceResultDetailsProps) => (
    <div className='pricing-evaluation-result'>
        <Typography.Title level={3} className='main-title'>
            Call us or visit us for a solution
        </Typography.Title>

        <div className='selection-info'>
            Your selection is:{' '}
            <strong>
                {brand} {model}
            </strong>{' '}
            has issues with <strong>{issue}</strong>.
        </div>

        <div className='price-section'>
            <div className='price-label'>The price of this repair:</div>
            <div className='price-value'>
                {currencyFormat(data.price)}
                {data.originalPrice && data.originalPrice > data.price && (
                    <span className='original-price'>
                        <s>{currencyFormat(data.originalPrice)}</s>
                    </span>
                )}
            </div>
        </div>

        <div className='note'>
            <i>You can come to our shop in person or send your device to us via mail.</i>
        </div>

        <div className='shop-info'>
            <ShopDetails />

            <div className='contact-section'>
                <div className='contact-text'>
                    If you would like to send your device to us for a repair, please contact us so we can clear any
                    details over the phone.
                </div>

                <Button
                    type='primary'
                    size='large'
                    icon={<FontAwesomeIcon icon={faPhone} />}
                    className='phone-button'
                    href={`tel:${shop.phone}`}
                >
                    {shop.phone}
                </Button>
            </div>
        </div>
    </div>
)

/* ==================== No Price Result ==================== */

interface NoPriceResultDetailsProps {
    shop: Shop
    brand: string
    model: string
    issue: string
}

const NoPriceResultDetails = ({ brand, model, issue, shop }: NoPriceResultDetailsProps) => (
    <div className='no-price-result'>
        <Typography.Title level={4}>Call us for a solution</Typography.Title>

        <p className='no-price-text'>
            Your situation is very specific and you will need to consult our staff for this. Nothing to worry about
            though! Give us a call with all of the information you have about the issue and we will be happy to provide
            a solution and possible quote for the work!
        </p>

        <div className='working-hours no-price-hours'>
            <strong>Working Days &amp; Hours</strong>
            <div>
                Mon - Sat : 09:00 AM - 07:00 PM
                <br />
                Sun : 10:00 AM - 04:30 PM
            </div>
        </div>

        <Button
            type='primary'
            size='large'
            icon={<FontAwesomeIcon icon={faPhone} />}
            className='phone-button'
            href={`tel:${shop.phone}`}
        >
            {shop.phone}
        </Button>
    </div>
)
function ShopDetails(): React.JSX.Element {
    return (
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
                <strong>Working Days &amp; Hours</strong>
                <div>
                    Mon - Sat : 09:00 AM - 07:00 PM
                    <br />
                    Sun : 10:00 AM - 04:30 PM
                </div>
            </div>
        </div>
    )
}
