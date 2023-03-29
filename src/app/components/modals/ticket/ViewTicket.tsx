import { AppModal } from '../AppModal'
import { CreateTicket, createTicketFromTicket, Ticket } from '../../../models/interfaces/ticket'
import { Field } from '../ViewInventoryItem'
import React, { useState } from 'react'
import dateFormat from 'dateformat'
import { EditButton } from '../../form/Button'
import { EditTicketForm } from './EditTicketForm'
import { postCompleteTicket, updateTicket } from '../../../axios/http/ticketRequests'
import { useQueryClient } from 'react-query'
import { dateTimeMask } from '../../../models/enums/appEnums'
import CreatableSelect from 'react-select/creatable'
import { ItemPropertyView } from '../../../models/interfaces/generalModels'
import { SelectStyles, SelectTheme } from '../../../styles/components/stylesTS'
import { DeviceLocationArray } from '../../../models/enums/ticketEnums'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { FormError } from '../../form/FormError'
import { CollectTicketForm } from './CollectTicketForm'

export const ViewTicket = ({ ticket, closeModal }: { ticket?: Ticket; closeModal: () => void }) => {
    const [mode, setMode] = useState('view')
    const [deviceLocation, setDeviceLocation] = useState('')
    const [deviceLocationError, setDeviceLocationError] = useState('')
    const queryClient = useQueryClient()

    const editTicket = (formValue: CreateTicket) => {
        return updateTicket({ id: ticket?.id ?? -1, ticket: formValue }).then(() => {
            queryClient.invalidateQueries(['tickets']).then()
            setMode('view')
        })
    }

    const completeTicket = (id: number) => {
        if (!deviceLocation || deviceLocation.trim().length == 0) setDeviceLocationError('New location is required')
        else {
            toast
                .promise(
                    postCompleteTicket({ id, location: deviceLocation }),
                    toastUpdatePromiseTemplate('ticket'),
                    toastProps
                )
                .then(() => queryClient.invalidateQueries(['tickets']).then(closeModal))
        }
    }
    const collectTicket = (invoice: {}, id: number) => {
        return toast
            .promise(
                postCompleteTicket({ id, location: deviceLocation }),
                toastUpdatePromiseTemplate('ticket'),
                toastProps
            )
            .then(() => queryClient.invalidateQueries(['tickets']).then(closeModal))
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
                    {mode === 'collect' && (
                        <CollectTicketForm
                            onComplete={collectTicket}
                            ticket={ticket}
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
                            {ticket.client && (
                                <div className='card'>
                                    <h4>Client</h4>
                                    <p>{ticket.client.fullName + ' ' + ticket.client.email}</p>
                                </div>
                            )}

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
                                    <div>Complete the repair</div>
                                    <div className='ticketActions'>
                                        <CreatableSelect<ItemPropertyView, false>
                                            isClearable
                                            theme={SelectTheme}
                                            styles={SelectStyles<ItemPropertyView>()}
                                            options={DeviceLocationArray}
                                            formatCreateLabel={(value) => 'Add a new location: ' + value}
                                            placeholder='New location'
                                            value={
                                                DeviceLocationArray.find(({ value }) => deviceLocation === value) ?? {
                                                    value: deviceLocation,
                                                    id: -1,
                                                }
                                            }
                                            onCreateOption={(item) => setDeviceLocation(item)}
                                            onChange={(newValue) => setDeviceLocation(newValue?.value ?? '')}
                                            getOptionLabel={(item) => item.value}
                                            getOptionValue={(item) => item.id + item.value}
                                        />
                                        <button className='actionButton' onClick={() => completeTicket(ticket.id)}>
                                            Complete repair
                                        </button>
                                    </div>
                                    <div className='ticketActions'>
                                        <FormError error={deviceLocationError} />
                                    </div>
                                    <div className='ticketActions'>
                                        <div>Mark as collected</div>
                                        <button className='actionButton'>Collected</button>
                                    </div>
                                </div>

                                <div className='card'>
                                    <h3>Other actions</h3>
                                    <div className='ticketActions'>
                                        <div>Open the chat with the customer</div>
                                        <button className='actionButton'>Chat</button>
                                    </div>
                                    <div className='ticketActions'>
                                        <div>Show as pdf</div>
                                        <button className='actionButton'>Print invoice</button>
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
