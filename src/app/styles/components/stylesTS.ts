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
