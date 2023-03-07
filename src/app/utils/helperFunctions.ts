export const capitalizeFirst = (str: string | undefined) => {
    return str?.substring(0, 1).toUpperCase().concat(str?.substring(1).toLowerCase())
}
