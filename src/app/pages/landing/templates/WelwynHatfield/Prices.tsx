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
import { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPublicBrands } from '../../../../axios/http/shopRequests'
import { CustomSuspense } from '../../../../components/CustomSuspense'
import { ThemeContext } from '../../../../contexts/ThemeContext'
import { deviceTypes } from '../../../../models/enums/deviceTypeEnums'
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
    const [urlParams, setUrlParams] = useSearchParams()
    const selectedDeviceType = urlParams.get('type') ?? ''
    const cleanDeviceType = Object.values(deviceTypes).includes(selectedDeviceType) ? selectedDeviceType : ''
    const [info, setInfo] = useState({ deviceType: cleanDeviceType, brand: {} as Brand, model: '', issue: '' })
    const [stepNum, setStepNum] = useState(!!cleanDeviceType ? 1 : 0)

    const SetDevice = (
        <SelectDevice
            isMobile={isMobile}
            selectedDeviceType={info.deviceType}
            setDevice={(deviceType: string) => {
                setInfo((i) => ({ ...i, deviceType }))
                setStepNum(1)
                setUrlParams({ type: deviceType }, { replace: true })
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
    const navigate = useNavigate()

    useEffect(() => {
        if (stepNum >= tasks.length) {
            navigate(`result?deviceType=${info.deviceType}&brand=${info.brand?.value}&model=${info.model}&issue=${info.issue}`)
        }
    }, [stepNum, tasks.length, navigate, info.deviceType, info.brand?.value, info.model, info.issue])

    if (stepNum >= tasks.length) {
        return null // or a loading indicator
    }
    const currentStep = tasks[stepNum]
    return (
        <div className='card'>
            <div className='flex justify-between'>
                <div className='flex'>
                    <Button
                        type='primary'
                        disabled={stepNum <= 1}
                        onClick={() => setStepNum(stepNum - 1)}
                        icon={<FontAwesomeIcon icon={faArrowLeft} />}
                        className='button'
                    />
                    <h2>Price evaluation</h2>
                </div>

                <span className='step-count'>
                    Step {stepNum + 1} of {tasks.length + 1}
                </span>
            </div>

            {isMobile && (
                <Breadcrumb
                    items={[
                        ...(info.deviceType
                            ? [
                                  {
                                      title: <a onClick={() => setStepNum(0)}>{info.deviceType}</a>,
                                  },
                              ]
                            : []),
                        ...(info?.brand?.value
                            ? [
                                  {
                                      title: <a onClick={() => setStepNum(1)}>{info.brand?.value}</a>,
                                  },
                              ]
                            : []),
                        ...(info.model
                            ? [
                                  {
                                      title: <a onClick={() => setStepNum(2)}>{info.model}</a>,
                                  },
                              ]
                            : []),
                        ...(info.issue
                            ? [
                                  {
                                      title: <a onClick={() => setStepNum(3)}>{info.issue}</a>,
                                  },
                              ]
                            : []),
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
                <div className='select-device-prompt'>
                    <h3>Please select a device type first</h3>
                    <p>Choose the type of device you need repaired from the options above to continue with the price evaluation.</p>
                </div>
            )}
        </div>
    )
}

export const issues = {
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
const SelectIssue = ({ deviceType, setIssue }: { setIssue: (issue: string) => void; deviceType: string }) => {
    return (
        <div className='choice-grid'>
            {issues[deviceType.toLowerCase() as keyof typeof issues].map((issue, index) => (
                <div key={'issue' + index} className='choice-item' onClick={() => setIssue(issue)}>
                    {issue}
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
                    {model.value}
                </div>
            ))}
            <div key={'other'} className='choice-item' onClick={() => setModel('Other model')}>
                Other model
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
                        {brand.value}
                    </div>
                ))}
                <div
                    key={'other'}
                    className='choice-item'
                    onClick={() => setBrand({ id: -1, value: 'Other brand', models: [] })}
                >
                    Other brand
                </div>
            </CustomSuspense>
        </div>
    )
}
const SelectDevice = ({ setDevice, isMobile, selectedDeviceType }: { setDevice: (deviceType: string) => void; isMobile: boolean; selectedDeviceType: string }) => {
    const choices = [
        {
            icon: <FontAwesomeIcon icon={faMobile} size='2xl' />,
            title: deviceTypes.mobile,
        },
        {
            icon: <FontAwesomeIcon icon={faTablet} size='2xl' />,
            title: deviceTypes.tablet,
        },
        {
            icon: <FontAwesomeIcon icon={faLaptop} size='2xl' />,
            title: deviceTypes.laptop,
        },
        {
            icon: <FontAwesomeIcon icon={faDesktop} size='2xl' />,
            title: deviceTypes.computer,
        },
        {
            icon: <img src='/custom-icons/electric_scooter.svg' alt='Electric scooter' />,
            title: deviceTypes.scooter,
        },
        {
            icon: <img src='/custom-icons/playstation-brands-solid-full.svg' alt='PlayStation' />,
            title: deviceTypes.ps,
        },
        {
            icon: <img src='/custom-icons/nintendo-switch.svg' alt='Nintendo switch' />,
            title: deviceTypes.Nswitch,
        },
        {
            icon: <FontAwesomeIcon icon={faGamepad} size='2xl' />,
            title: deviceTypes.Gconsole,
        },
        {
            icon: <FontAwesomeIcon icon={faQuestion} size='2xl' />,
            title: deviceTypes.other,
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
                    <div key={index} className={`choice-item ${choice.title === selectedDeviceType ? 'selected' : ''}`} onClick={() => setDevice(choice.title)}>
                        <div className='choice-icon'>{choice.icon}</div>
                        <span>{choice.title}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
