import { Control, Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'

const FormTextField = (props: { control: Control<any, any>, name: string, label: string, type?: string }) => {
    const { control, name } = props
    return <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
            <TextField
                margin='normal'
                required
                fullWidth
                autoComplete={name}
                autoFocus
                error={fieldState.invalid}
                onChange={field.onChange}
                {...props}
            />
        )}
    />
}

export default FormTextField