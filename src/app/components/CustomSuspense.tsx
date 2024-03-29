import { ReactNode, Suspense, useContext } from 'react'
import { InfinitySpin } from 'react-loader-spinner'
import { ThemeContext } from '../contexts/ThemeContext'

export const CustomSuspense = ({ children, isReady }: { isReady?: boolean; children: ReactNode }) => {
    const { colors } = useContext(ThemeContext)
    const color = colors?.primaryColor ?? 'cyan'

    return isReady ? (
        <Suspense fallback={<InfinitySpin color={color} />}>{children}</Suspense>
    ) : (
        <InfinitySpin color={color} />
    )
}
