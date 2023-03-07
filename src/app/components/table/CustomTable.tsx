import React, { ReactNode } from 'react';

interface CustomTableProps<T> {
    headers: string[]
    onClick?: (value: T) => void
    data: any[]
}

export const CustomTable = <T,>({ data, onClick }: CustomTableProps<T>) => {
    return (
        <table className='table table-bordered'>
            <thead>
                <tr>
                    {Object.entries(data[0]).map(([key], index) => (
                        <th key={'key' + index}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={`row.${rowIndex}`} className={onClick && 'clickable'} onClick={() => onClick && onClick(row)}>
                        {Object.entries(row).map(([, value], index) => (
                            <td key={`cell.${rowIndex}.${index}`}>{value as ReactNode}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
