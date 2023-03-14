import { AppModal } from './AppModal'
import { Ticket } from '../../models/interfaces/ticket'
import { Field } from './ViewInventoryItem'
import React from 'react'
import dateFormat from 'dateformat'
import { EditButton } from '../form/Button'

export const ViewTicket = ({ ticket, closeModal }: { ticket?: Ticket; closeModal: () => void }) => {
    return (
        <AppModal isModalOpen={!!ticket} closeModal={closeModal}>
            <h3>Ticket</h3>
            {ticket && (
                <div className='viewModal'>
                    <h3>Details</h3>
                    <div className='flex-100 justify-between'>
                        <h4>Problem explanation</h4>
                        <EditButton onClick={() => {}} />
                    </div>
                    <div className='card'>
                        <p>{ticket.problemExplanation}</p>
                        <Field name='Ticket status' value={ticket.status} />
                        <Field name='Device location' value={ticket.deviceLocation} />
                    </div>
                    <div className='flex-100 justify-around'>
                        <div className='field'>
                            <h4>Created at</h4>
                            <div>{dateFormat(ticket.timestamp)}</div>
                        </div>
                        <div className='field'>
                            <h4>Deadline</h4>
                            <div>{dateFormat(ticket.deadline)}</div>
                        </div>
                    </div>
                    <h3>Payment</h3>

                    <div className='card'>
                        <Field name='Deposit' value={ticket.deposit} />
                        <Field name='Total price' value={ticket.totalPrice} />
                    </div>
                    <h3>Device details</h3>

                    <div className='card'>
                        <Field name='Brand' value={ticket.deviceBrand} />
                        <Field name='Model' value={ticket.deviceModel} />
                        <Field name='Serial number / IMEI' value={ticket.serialNumberOrImei} />
                        <Field name='Device password' value={ticket.devicePassword} />
                        <Field name='Device condition' value={ticket.deviceCondition} />
                    </div>
                    <h3>Other information</h3>

                    <div className='card'>
                        <Field name='Customer request' value={ticket.customerRequest} />
                        <Field name='Additional accessories' value={ticket.accessories} />
                        <Field name='Notes' value={ticket.notes} />
                    </div>
                    {/*Actions with ticket*/}
                    <div></div>
                </div>
            )}
        </AppModal>
    )
}
