import { AppError } from '../../models/interfaces/generalModels'
import backendClient from '../backendClient'

export const getImage = (imageUrl: string):Promise<Blob>=> {
    return backendClient.get<any,Blob>(imageUrl, { responseType: 'blob' }).catch((error:AppError)=>{return new Blob()});
}
