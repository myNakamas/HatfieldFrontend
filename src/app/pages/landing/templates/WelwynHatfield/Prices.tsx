import {
    faArrowLeft,
    faDesktop,
    faGamepad,
    faLaptop,
    faMobile,
    faQuestion,
    faTablet,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Breadcrumb, Button, Progress } from 'antd'
import { useContext, useState } from 'react'
import { useQuery } from 'react-query'
import { getPublicBrands } from '../../../../axios/http/shopRequests'
import { CustomSuspense } from '../../../../components/CustomSuspense'
import { ThemeContext } from '../../../../contexts/ThemeContext'
import { ItemPropertyView } from '../../../../models/interfaces/generalModels'
import { Brand } from '../../../../models/interfaces/shop'

interface EvaluationTask {
    key: string
    title: string
    content: JSX.Element
    subTitle: string
}

export const Prices = () => {
    const isMobile = window.innerWidth <= 768
    const [info, setInfo] = useState({ deviceType: '', brand: {} as Brand, model: '', issue: '' })
    const [stepNum, setStepNum] = useState(0)

    const SetDevice = (
        <SelectDevice
            isMobile={isMobile}
            setDevice={(deviceType: string) => {
                setInfo((i) => ({ ...i, deviceType }))
                setStepNum(1)
            }}
        />
    )

    const tasks: EvaluationTask[] = [
        {
            key: 'select-device',
            title: 'Select device type',
            content: SetDevice,
            subTitle: 'Please select the type of your broken device',
        },
        {
            key: 'select-brand',
            title: 'Select device Brand',
            content: (
                <SelectBrand
                    setBrand={(brand: Brand) => {
                        setInfo((i) => ({ ...i, brand }))
                        setStepNum(2)
                    }}
                />
            ),
            subTitle: 'Please select the brand of your broken ' + info?.deviceType,
        },
        {
            key: 'select-model',
            title: 'Select device Model',
            content: (
                <SelectModel
                    models={info.brand?.models ?? []}
                    setModel={(model: string) => {
                        setInfo((i) => ({ ...i, model }))
                        setStepNum(3)
                    }}
                />
            ),
            subTitle: 'Please select model of your ' + info?.brand.value + ' ' + info?.deviceType,
        },
        {
            key: 'select-issue',
            title: 'Select damage type',
            content: (
                <SelectIssue
                    deviceType={info.deviceType}
                    setIssue={(issue: string) => {
                        setInfo((i) => ({ ...i, issue }))
                        setStepNum(4)
                    }}
                />
            ),
            subTitle: 'Please select the issue with your ' + info?.brand.value + ' ' + info?.model,
        },
    ]

    return (
        <div className='prices'>
            <div className='container'>
                {!isMobile && SetDevice}
                <EvaluationSteps
                    {...{ tasks, info, isMobile, stepNum }}
                    setStepNum={(newNum) => {
                        const newInfo = { ...info }
                        if (newNum <= 3) newInfo.issue = ''
                        if (newNum <= 2) newInfo.model = ''
                        if (newNum <= 1) newInfo.brand = {} as Brand
                        if (newNum <= 0) newInfo.deviceType = ''
                        setStepNum(newNum)
                        setInfo(newInfo)
                    }}
                />
            </div>
        </div>
    )
}

const EvaluationSteps = ({
    info,
    tasks,
    isMobile,
    stepNum,
    setStepNum,
}: {
    tasks: EvaluationTask[]
    stepNum: number
    setStepNum: (step: number) => void
    info: { deviceType: string; brand?: Brand; model: string; issue: string }
    isMobile: boolean
}) => {
    const { colors } = useContext(ThemeContext)
    if (stepNum >= tasks.length) {
        return <div className='card'>Show final prices here</div>
    }
    const currentStep = tasks[stepNum]
    return (
        <div className='card'>
            <div className='flex'>
                <Button
                    type='primary'
                    disabled={stepNum <= 0}
                    onClick={() => setStepNum(stepNum - 1)}
                    icon={<FontAwesomeIcon icon={faArrowLeft} />}
                />
                <h2>Price evaluation</h2>
                <span className='step-count'>
                    {' '}
                    Step {stepNum + 1} of {tasks.length + 1}
                </span>
            </div>

            {isMobile && (
                <Breadcrumb
                    items={[
                        {
                            title: info.deviceType ? <a onClick={() => setStepNum(0)}>{info.deviceType}</a> : null,
                        },
                        {
                            title: info?.brand?.value ? <a onClick={() => setStepNum(1)}>{info.brand?.value}</a> : null,
                        },
                        {
                            title: info.model ? <a onClick={() => setStepNum(2)}>{info.model}</a> : null,
                        },
                        {
                            title: info.issue ? <a onClick={() => setStepNum(3)}>{info.issue}</a> : null,
                        },
                    ]}
                />
            )}
            <Progress
                strokeColor={colors?.primaryColor}
                percent={Math.round((stepNum / tasks.length) * 100)}
                type='line'
            />
            {isMobile || currentStep.key !== 'select-device' ? (
                <div>
                    <h3>{currentStep.title}</h3>
                    <span>{currentStep.subTitle}</span>
                    <div className='task-content'>{currentStep.content}</div>
                </div>
            ) : (
                'loading'
            )}
        </div>
    )
}

const SelectIssue = ({ deviceType, setIssue }: { setIssue: (issue: string) => void; deviceType: string }) => {
    const issues = {
        smartphone: [
            'Cracked screen',
            'Back cracked',
            'Phone not starting',
            'Battery not working',
            'Not charging',
            'Other issue',
        ],
        laptop: ['Cracked screen', 'Laptop not starting', 'Battery not working', 'Not charging', 'Other issue'],
        tablet: ['Cracked screen', 'Tablet not starting', 'Battery not working', 'Not charging', 'Other issue'],
        pc: ['Operation system issues', 'PC not starting', 'Hark disk space not enough', 'Other issue'],
    }
    return (
        <div className='choice-grid'>
            {issues[deviceType.toLowerCase() as keyof typeof issues].map((issue, index) => (
                <div key={'issue' + index} className='choice-item' onClick={() => setIssue(issue)}>
                    <div className='choice-item'>{issue}</div>
                </div>
            ))}
        </div>
    )
}
const SelectModel = ({ models, setModel }: { models: ItemPropertyView[]; setModel: (model: string) => void }) => {
    if (!models) return <div>Please select a brand first</div>
    return (
        <div className='choice-grid'>
            {models?.map((model, index) => (
                <div key={'model' + index} className='choice-item' onClick={() => setModel(model.value)}>
                    <div className='choice-item'>{model.value}</div>
                </div>
            ))}
            <div key={'other'} className='choice-item' onClick={() => setModel('Other model')}>
                <div className='choice-item'>Other brand</div>
            </div>
        </div>
    )
}
const SelectBrand = ({ setBrand }: { setBrand: (brand: Brand) => void }) => {
    const { data: brands, isLoading } = useQuery('brands', () => getPublicBrands())
    return (
        <div className='choice-grid'>
            <CustomSuspense isReady={!isLoading}>
                {brands?.map((brand, index) => (
                    <div key={'brand' + index} className='choice-item' onClick={() => setBrand(brand)}>
                        <div className='choice-item'>{brand.value}</div>
                    </div>
                ))}
                <div
                    key={'other'}
                    className='choice-item'
                    onClick={() => setBrand({ id: -1, value: 'Other brand', models: [] })}
                >
                    <div className='choice-item'>Other brand</div>
                </div>
            </CustomSuspense>
        </div>
    )
}
const SelectDevice = ({ setDevice, isMobile }: { setDevice: (deviceType: string) => void; isMobile: boolean }) => {
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
            title: 'PC',
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
            {!isMobile && (
                <div>
                    <h2>Select device type</h2>
                    <span>Please select the type of your broken device</span>
                </div>
            )}

            <div className='choice-grid'>
                {choices.map((choice, index) => (
                    <div key={index} className='choice-item' onClick={() => setDevice(choice.title)}>
                        <div className='choice-icon'>{choice.icon}</div>
                        <span>{choice.title}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
