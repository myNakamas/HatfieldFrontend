import { QueryClientConfig, QueryObserverOptions } from 'react-query/types/core'
import { Page } from '../models/interfaces/generalModels'

export const defaultQueryClientConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            retry: (_: any, e: any) => e.status !== 403,
        },
    },
}

export const disabledRefetching: QueryObserverOptions<any, any> = {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    refetchInterval: false,
    staleTime: Infinity,
}

export const appGetNextPageParam = (lastPage: Page<unknown>) =>
    lastPage.page + 1 <= lastPage.pageCount ? lastPage.page + 1 : undefined
export const appGetPreviousPageParam = (firstPage: Page<unknown>) =>
    firstPage.page - 1 > 0 ? firstPage.page - 1 : undefined
