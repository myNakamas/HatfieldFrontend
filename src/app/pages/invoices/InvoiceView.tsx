import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { getInvoiceById, getInvoicePdf } from '../../axios/http/invoiceRequests'
import dateFormat from 'dateformat'
import { invoiceTypeIcon, paymentMethodIcon } from '../../models/enums/invoiceEnums'
import { Button, Descriptions, Space } from 'antd'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import { CustomSuspense } from '../../components/CustomSuspense'

export const InvoiceView = () => {
    const { id } = useParams()
    if (!id) return <NoDataComponent items={'information'} />
    const { data: invoice } = useQuery(['invoices', id], () => getInvoiceById(+id))

    const openPdf = async (invoiceId: number) => {
        const pdfBlob = await getInvoicePdf(invoiceId)
        if (pdfBlob) {
            const fileUrl = URL.createObjectURL(pdfBlob)
            const pdfPage = window.open(fileUrl)
            if (pdfPage) pdfPage.document.title = 'Hatfield Invoice ' + invoiceId
        }
    }

    return (
        <div className='mainScreen'>
            <CustomSuspense isReady={!!invoice}>
                {invoice && (
                    <div>
                        <Space wrap>
                            <Descriptions bordered title={'Invoice ' + id}>
                                <Descriptions.Item label={'Type'}>
                                    <FontAwesomeIcon icon={invoiceTypeIcon[invoice.type]} /> {invoice.type}
                                </Descriptions.Item>
                                <Descriptions.Item label={'Created at'}>
                                    {dateFormat(invoice.timestamp)}
                                </Descriptions.Item>
                                <Descriptions.Item label={'Created by'}>{invoice.createdBy.fullName}</Descriptions.Item>
                                <Descriptions.Item label={'Total price'}>
                                    {invoice.totalPrice.toFixed(2)}
                                </Descriptions.Item>
                                {invoice.client && <Descriptions.Item label={'Client name'}>{invoice.client.fullName}</Descriptions.Item>}
                                <Descriptions.Item label={'Payment method'}>
                                    <FontAwesomeIcon icon={paymentMethodIcon[invoice.paymentMethod]} />{' '}
                                    {invoice.paymentMethod}
                                </Descriptions.Item>
                                <Descriptions.Item label={'Warranty period'}>
                                    {invoice.warrantyPeriod}
                                </Descriptions.Item>
                                <Descriptions.Item label={'Notes'}>{invoice.notes}</Descriptions.Item>
                            </Descriptions>
                            <Space direction='vertical'>
                                <h3>Actions</h3>
                                <Button icon={<FontAwesomeIcon icon={faPrint} />} onClick={() => openPdf(invoice.id)}>
                                    Open document for print
                                </Button>
                            </Space>

                            <Descriptions bordered title={'Device properties '}>
                                <Descriptions.Item label={'Brand:'}>{invoice.deviceBrand}</Descriptions.Item>
                                <Descriptions.Item label={'Model:'}>{invoice.deviceModel}</Descriptions.Item>
                                <Descriptions.Item label={'Serial number/IMEI'}>
                                    {invoice.serialNumber}
                                </Descriptions.Item>
                                {invoice.ticketId && (
                                    <Descriptions.Item label={'Repair Ticket ID'}>{invoice.ticketId}</Descriptions.Item>
                                )}
                            </Descriptions>
                        </Space>
                    </div>
                )}
            </CustomSuspense>
        </div>
    )
}
