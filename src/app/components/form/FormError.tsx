import React from 'react'

export const FormError = ({ error }: { error?: string }) => {
    return error ? <div className='errorText'>{error}</div> : <></>
}
