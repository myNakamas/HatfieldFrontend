import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'
import { Filter } from '../../models/interfaces/filters'
import { Button, Input } from 'antd'

export const AdvancedSearchButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <Button type={'text'} icon={<FontAwesomeIcon icon={faMagnifyingGlass}/>} onClick={onClick}>
        Advanced search
    </Button>
    )
}
