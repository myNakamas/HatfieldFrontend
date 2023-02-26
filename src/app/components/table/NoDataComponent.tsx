import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

export const NoDataComponent = ({ items }: { items: string }) => {
    return (
        <div className='noData'>
            <FontAwesomeIcon size='3x' icon={faXmarkCircle} />
            <h3>No {items} found</h3>
        </div>
    )
}
