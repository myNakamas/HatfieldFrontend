import { ThemeColors } from '../models/interfaces/shop'

const createCssVar = (items: any, prefix = '-'): string[] => {
    if (items) {
        Object.entries(items).flatMap(([key, value]) => {
            const varName = `${prefix}-${key}`
            if (typeof value === 'object') return createCssVar(value, varName)
            return `${varName}:${value}`
        })
    }
    return []
}

export const createCssVars = (themeColors: ThemeColors) => createCssVar(themeColors).join(';')

//@media (prefers-color-scheme: dark) {
//   :root {
//     /* Your theme specific styles */
//   }
// }
