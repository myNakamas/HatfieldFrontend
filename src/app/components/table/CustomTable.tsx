import React from "react";

interface CustomTableProps {
    data: any[]
    noDataComponent?: JSX.Element
}

export const CustomTable = <T,>({ data }: CustomTableProps) => {
    return (
        <table>
            <thead>
                <tr>
                    {Object.entries(data[0]).map(([key]) => (
                        <th>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row) => {
                    return Object.entries(row).map(([, value]) => <td>{value as any}</td>)
                })}
            </tbody>
        </table>
    )
}
