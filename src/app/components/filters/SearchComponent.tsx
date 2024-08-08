import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlass'
import { Filter } from '../../models/interfaces/filters'
import { Input } from 'antd'
import { SearchProps } from 'antd/es/input'

export const SearchComponent = ({
    filter,
    setFilter,
    ...rest
}: { filter: Filter; setFilter: (value: Filter) => void } & SearchProps) => {
    const onChange = (value: string) => {
        setFilter({ ...filter, searchBy: value })
    }

    return (
        <Input.Search
            {...rest}
            value={filter.searchBy ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder='Search here...'
        />
    )
}
