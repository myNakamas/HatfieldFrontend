import React from 'react'
import { ButtonProps } from '../../models/interfaces/generalModels'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'

export const Button = (button: ButtonProps) => {
    return (
        <button className={button.className} onClick={button.onAction}>
            {button.content}
        </button>
    )
}

export const EditButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button className='iconButton' onClick={onClick}>
            <FontAwesomeIcon icon={faPenToSquare} size={'lg'} />
        </button>
    )
}
