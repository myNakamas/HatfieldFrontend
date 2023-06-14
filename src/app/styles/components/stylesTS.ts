import { StylesConfig, Theme } from 'react-select'

export const getSystemMode = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
    }
    return 'light'
}
export const getColorsPerSystem = () => {
    if (getSystemMode() === 'dark') {
        return {
            color: '#fff',
            color10: '#E7E7E7FF',
            colorTransparent: 'rgba(255,255,255,0.8)',
            backgroundColor: '#121212',
            backgroundColor10: '#323232',
            backgroundTransparent: 'rgba(18,18,18,0.8)',
        }
    }
    return {
        color: '#121212',
        color10: '#323232',
        colorTransparent: 'rgba(18,18,18,0.8)',
        backgroundColor: '#fff',
        backgroundColor10: '#E7E7E7FF',
        backgroundTransparent: 'rgba(255,255,255,0.8)',
    }
}

export const SelectTheme = (theme: Theme): Theme => {
    const { backgroundColor, color, backgroundColor10, color10 } = getColorsPerSystem()
    return {
        ...theme,
        colors: {
            ...theme.colors,
            primary: color,
            primary25: backgroundColor10,
            neutral80: color10,
            neutral0: backgroundColor,
            neutral10: backgroundColor10,
        },
    }
}
export const SelectStyles = <T>(): StylesConfig<T> => {
    return {
        container: (styles) => ({
            ...styles,
            minWidth: 200,
            maxWidth: 400,
            textAlign: 'left',
        }),
        menuPortal: (styles) => ({
            ...styles,
            zIndex: 10,
        }),
    }
}
