import { GlobalError } from 'react-hook-form'

export const FormError = ({ error }: { error: (Record<string, GlobalError> & GlobalError) | undefined }) => {
    return <div>{error?.message}</div>
}
