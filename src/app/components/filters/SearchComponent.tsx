import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass';
import { Filter } from '../../models/interfaces/filters';

export const SearchComponent = ({ filter, setFilter }: { filter: Filter; setFilter: (value: Filter) => void }) => {
    const onChange = (value: string) => {
        setFilter({ ...filter, searchBy: value })
    }

    return (
        <div className='filterField search'>
            <input
                value={filter.searchBy ?? ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder='Search here...'
            />
            <FontAwesomeIcon className='icon' icon={faMagnifyingGlass} />
        </div>
    )
}
