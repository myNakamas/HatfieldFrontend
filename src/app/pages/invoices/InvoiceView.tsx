import React, { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NoDataComponent } from '../../components/table/NoDataComponent'
import { getInvoiceById, getInvoicePdf, invalidateInvoice } from '../../axios/http/invoiceRequests'
import dateFormat from 'dateformat'
import { invoiceTypeIcon, paymentMethodIcon } from '../../models/enums/invoiceEnums'
import { Button, Descriptions, Result, Space, Typography } from 'antd'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import { CustomSuspense } from '../../components/CustomSuspense'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { AppError } from '../../models/interfaces/generalModels'
import { Invoice } from '../../models/interfaces/invoice'
import { disabledRefetching } from '../../axios/reactQueryProps'
import { AuthContext } from '../../contexts/AuthContext'

export const InvoiceView = () => {
    const { isWorker } = useContext(AuthContext)
    const { id } = useParams()
    const navigate = useNavigate()
    if (!id) return <NoDataComponent items={'information'} />
    const {
        data: invoice,
        isError,
        isLoading,
    } = useQuery<Invoice, AppError>(['invoices', id], () => getInvoiceById(+id), disabledRefetching)
    const queryClient = useQueryClient()

    const openPdf = async (invoiceId: number) => {
        const pdfBlob = await getInvoicePdf(invoiceId)
        if (pdfBlob) {
            const fileUrl = URL.createObjectURL(pdfBlob)
            const pdfPage = window.open(fileUrl)
            if (pdfPage) pdfPage.document.title = 'Hatfield Invoice ' + invoiceId
        }
    }

    const onDelete = (id: number) => {
        toast.promise(invalidateInvoice(id), toastUpdatePromiseTemplate('invoice'), toastProps).then(() => {
            queryClient.invalidateQueries(['invoices']).then(() => {
                navigate('/invoices')
            })
        })
    }

    return (
        <div className='mainScreen'>
            <CustomSuspense isReady={!isLoading}>
                {isError && <InvoiceAccessError />}
                {!isError && invoice && (
                    <Space wrap className={'justify-around flex-100'}>
                        <Space direction={'vertical'}>
                            {!invoice.valid && (
                                <Space className='warning-box'>
                                    <FontAwesomeIcon size={'2x'} icon={faExclamationTriangle} />
                                    <div>
                                        <h3>Caution! Invalid Invoice</h3>
                                        <Typography>
                                            We wish to inform you that this particular invoice has been flagged as
                                            invalid by a user and, consequently, will not be recognized by our system.
                                        </Typography>
                                    </div>
                                </Space>
                            )}
                            <Descriptions bordered title={'Invoice #' + id}>
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
                                {invoice.client && (
                                    <Descriptions.Item label={'Client name'}>
                                        {invoice.client.fullName}
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label={'Payment method'}>
                                    <FontAwesomeIcon icon={paymentMethodIcon[invoice.paymentMethod]} />{' '}
                                    {invoice.paymentMethod}
                                </Descriptions.Item>
                                <Descriptions.Item label={'Warranty period'}>
                                    {invoice.warrantyPeriod}
                                </Descriptions.Item>
                                <Descriptions.Item label={'Notes'}>{invoice.notes}</Descriptions.Item>
                            </Descriptions>
                            <Descriptions bordered title={'Device properties '}>
                                <Descriptions.Item label={'Device name:'}>{invoice.deviceName}</Descriptions.Item>
                                <Descriptions.Item label={'Serial number/IMEI'}>
                                    {invoice.serialNumber}
                                </Descriptions.Item>
                                {invoice.ticketId && (
                                    <Descriptions.Item label={'Repair Ticket ID'}>{invoice.ticketId}</Descriptions.Item>
                                )}
                            </Descriptions>
                        </Space>
                        <Space direction='vertical'>
                            <h3>Actions</h3>
                            <Button icon={<FontAwesomeIcon icon={faPrint} />} onClick={() => openPdf(invoice.id)}>
                                Open document for print
                            </Button>
                            {invoice.valid && isWorker() && (
                                <Button icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => onDelete(invoice.id)}>
                                    Invalidate invoice
                                </Button>
                            )}
                        </Space>
                    </Space>
                )}
            </CustomSuspense>
        </div>
    )
}
/**
 * The {@link Result} can be used together with the status to display interactive icons.
 * This is an example usage of the component
 */
const InvoiceAccessError = () => {
    const navigate = useNavigate()
    return (
        <Result
            status='403'
            title='Forbidden access'
            subTitle='Sorry, you do not have permission to view this invoice.'
            extra={<Button onClick={() => navigate('/home')}>Go home</Button>}
        />
    )
}
