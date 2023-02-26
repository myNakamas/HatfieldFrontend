import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
    username: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
})
export const CreateUserSchema = Yup.object().shape({
    username: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
})

export const AddItemInventorySchema = Yup.object().shape({
    model: Yup.object().notRequired(),
    brand: Yup.object().notRequired(),
    count: Yup.number().min(1,"Invalid number").required('Required'),
    type: Yup.object().required()
})

