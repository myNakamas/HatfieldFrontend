import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'
import { Filter } from '../../models/interfaces/filters'
import { Input } from 'antd'

export const SearchComponent = ({ filter, setFilter }: { filter: Filter; setFilter: (value: Filter) => void }) => {
    const onChange = (value: string) => {
        setFilter({ ...filter, searchBy: value })
    }

    return (
        <Input
            prefix={<FontAwesomeIcon className='icon' icon={faMagnifyingGlass} />}
            value={filter.searchBy ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Search here...'
        />
    )
}
