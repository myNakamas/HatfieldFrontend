import { AppModal } from '../AppModal'
import { CreateTicket, createTicketFromTicket, Ticket } from '../../../models/interfaces/ticket'
import { Field } from '../ViewInventoryItem'
import React, { useState } from 'react'
import dateFormat from 'dateformat'
import { EditButton } from '../../form/Button'
import { EditTicketForm } from './EditTicketForm'
import { updateTicket } from '../../../axios/http/ticketRequests'
import { useQueryClient } from 'react-query'
import { dateTimeMask } from '../../../models/enums/appEnums'

export const ViewTicket = ({ ticket, closeModal }: { ticket?: Ticket; closeModal: () => void }) => {
    const [mode, setMode] = useState('view')
    const queryClient = useQueryClient()

    const editTicket = (formValue: CreateTicket) => {
        return updateTicket({ id: ticket?.id ?? -1, ticket: formValue }).then(() => {
            queryClient.invalidateQueries(['tickets'])
            setMode('view')
        })
    }

    return (
        <AppModal
            isModalOpen={!!ticket}
            closeModal={() => {
                setMode('view')
                closeModal()
            }}
        >
            {ticket && (
                <>
                    <div className='flex-100 justify-between align-center'>
                        <h2>Ticket</h2>
                        {mode !== 'edit' ? <EditButton onClick={() => setMode('edit')} /> : <div />}
                    </div>
                    {mode === 'edit' && (
                        <EditTicketForm
                            onComplete={editTicket}
                            ticket={createTicketFromTicket(ticket)}
                            onCancel={() => setMode('view')}
                        />
                    )}
                    {mode === 'view' && (
                        <div className='viewModal'>
                            <div className='flex-100 justify-around'>
                                <h2 className='flex-grow'>Details</h2>
                                <div className='field'>
                                    <h4>Created at</h4>
                                    <div>{dateFormat(ticket.timestamp, dateTimeMask)}</div>
                                </div>
                                <div className='field'>
                                    <h4>Deadline</h4>
                                    <div>{dateFormat(ticket.deadline, dateTimeMask)}</div>
                                </div>
                            </div>

                            <h4>Problem explanation</h4>
                            <div className='card'>
                                <p>{ticket.problemExplanation}</p>
                            </div>

                            <div className='flex-100 justify-around'>
                                <div className='field'>
                                    <h4>Ticket status</h4>
                                    <div>{ticket.status}</div>
                                </div>
                                <div className='field'>
                                    <h4>Current Location</h4>
                                    <div>{ticket.deviceLocation}</div>
                                </div>
                            </div>
                            <div className='flex'>
                                <div className='flex-grow'>
                                    <h3>Payment</h3>
                                    <div className='card'>
                                        <Field name='Deposit' value={ticket.deposit?.toFixed(2)} />
                                        <Field name='Total price' value={ticket.totalPrice?.toFixed(2)} />
                                    </div>
                                </div>

                                <div className='flex-grow'>
                                    <h3>Device details</h3>

                                    <div className='card'>
                                        <Field name='Brand' value={ticket.deviceBrand} />
                                        <Field name='Model' value={ticket.deviceModel} />
                                        <Field name='Serial number / IMEI' value={ticket.serialNumberOrImei} />
                                        <Field name='Device password' value={ticket.devicePassword} />
                                        <Field name='Device condition' value={ticket.deviceCondition} />
                                    </div>
                                </div>
                            </div>

                            <h3>Other information</h3>

                            <div className='card'>
                                <Field name='Customer request' value={ticket.customerRequest} />
                                <Field name='Additional accessories' value={ticket.accessories} />
                                <Field name='Notes' value={ticket.notes} />
                            </div>
                            {/*Actions with ticket*/}
                            <div className='ticketActions'>
                                <div className='card'>
                                    <h3>Ticket status</h3>
                                    <div className='ticketActions'>
                                        <div>Start the repair</div>
                                        <button className='actionButton'>Start repair</button>
                                    </div>
                                    <div className='ticketActions'>
                                        <div>Complete the repair</div>
                                        <button className='actionButton'>Complete repair</button>
                                    </div>
                                </div>
                                <div className='card'>
                                    <h3>Ticket status</h3>
                                    <div className='ticketActions'>
                                        <div>Start the repair</div>
                                        <button className='actionButton'>Start repair</button>
                                    </div>
                                    <div className='ticketActions'>
                                        <div>Complete the repair</div>
                                        <button className='actionButton'>Complete repair</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AppModal>
    )
}
