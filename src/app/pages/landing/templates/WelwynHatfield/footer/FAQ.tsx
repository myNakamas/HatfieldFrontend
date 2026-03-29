import { Collapse, Divider } from 'antd'

const { Panel } = Collapse

export const FAQ: React.FC = () => {
    const repairItems = [
        {
            key: '1',
            label: 'Is any data deleted or removed during the repair?',
            children: (
                <p>No, your data does not get deleted or removed when your phone or mobile device is being repaired.</p>
            ),
        },
        {
            key: '2',
            label: 'What about the quality of spare parts that are used for my phone repairs?',
            children: (
                <p>
                    The quality of spare parts that are used for your mobile phone repairs are of top quality and are
                    genuine.
                </p>
            ),
        },
        {
            key: '3',
            label: 'How do you repair Water Damaged phones and Phones which do not power on?',
            children: (
                <p>
                    Mobile Phones which do not power on, or are water damaged are not normal repairs. They require a
                    great deal of inspection and diagnosis. It usually takes us 2 to 3 days to actually inspect the
                    water damaged phone. It is only then we contact yourself with the suggested repairs.
                </p>
            ),
        },
    ]

    const warrantyItems = [
        {
            key: '1',
            label: 'Any specifics for the warranty?',
            children: (
                <p>
                    As a normal company policy, every repair job that we undertake comes with a{' '}
                    <strong>4 weeks warranty</strong>, subject to no physical or liquid damage.
                </p>
            ),
        },
    ]

    return (
        <div className='staticPageCard'>
            <h1>Frequently asked questions</h1>
            <h2>Repairs</h2>

            <Collapse items={repairItems} accordion />

            <Divider />

            <h2>Repair Warranty</h2>

            <Collapse items={warrantyItems} accordion defaultActiveKey='1' />
        </div>
    )
}
