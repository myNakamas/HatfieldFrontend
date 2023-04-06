import backendClient from '../backendClient'
import { PageRequest } from '../../models/interfaces/generalModels'
import { Filter } from '../../models/interfaces/filters'
import { Invoice } from '../../models/interfaces/invoice'

export const getAllInvoices = ({}: { page: PageRequest; filter: Filter }): Promise<Invoice[]> => {
    return backendClient.get('invoice/all')
}
