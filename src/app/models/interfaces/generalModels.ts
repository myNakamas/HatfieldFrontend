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
