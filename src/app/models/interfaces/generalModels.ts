export interface Entity {
    id: number
}

export interface PageRequest {
    pageSize: number
    page: number
}

export interface Page<T> {
    page: number
    pageSize: number
    totalCount: number
    pageCount: number
    content: T[]
}

export interface AppError {
    detail: string
    instance: string
    status: number
    title: string
    type: string
}

export interface ItemPropertyView extends Entity {
    value: string
}

export interface ResponseMessage {
    detail: string
}
