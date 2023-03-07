import React from 'react'
import { ButtonProps } from '../../models/interfaces/generalModels'

export const Button = (button: ButtonProps) => {
    return (
        <button className={button.className} onClick={button.onAction}>
            {button.content}
        </button>
    )
}
