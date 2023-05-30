import { QueryClientConfig, QueryObserverOptions } from 'react-query/types/core'

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
