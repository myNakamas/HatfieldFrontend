import { AppModal } from '../AppModal'
import { CreateTicket, createTicketFromTicket, Ticket } from '../../../models/interfaces/ticket'
import React, { useState } from 'react'
import dateFormat from 'dateformat'
import { EditTicketForm } from './EditTicketForm'
import { postCompleteTicket, postStartTicket, updateTicket } from '../../../axios/http/ticketRequests'
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
import { Button, Descriptions, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'

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

    const startTicket = (id: number) => {
        toast
            .promise(postStartTicket({ id }), toastUpdatePromiseTemplate('ticket'), toastProps)
            .then(() => queryClient.invalidateQueries(['tickets']).then())
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
            title={'Ticket'}
        >
            {ticket && (
                <>
                    <div className='flex-100 justify-end '>
                        {mode !== 'edit' ? (
                            <Button
                                icon={<FontAwesomeIcon icon={faPenToSquare} size={'lg'} />}
                                onClick={() => setMode('edit')}
                            />
                        ) : (
                            <></>
                        )}
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
                            <TicketDescription ticket={ticket} />
                            {/*Actions with ticket*/}
                            <div className='ticketActions'>
                                <div className='card'>
                                    <h3>Ticket status</h3>
                                    <div className='ticketActions'>
                                        <div>Start the repair</div>
                                        <Button
                                            onClick={() => startTicket(ticket.id)}
                                            disabled={ticket.status !== 'PENDING'}
                                        >
                                            Start repair
                                        </Button>
                                    </div>
                                    <div>Complete the repair</div>
                                    <Space>
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
                                        <Button onClick={() => completeTicket(ticket.id)}>Finish repair</Button>
                                    </Space>
                                    <div className='ticketActions'>
                                        <FormError error={deviceLocationError} />
                                    </div>
                                    <div className='ticketActions'>
                                        <div>Mark as collected</div>
                                        <Button>Collected</Button>
                                    </div>
                                </div>

                                <div className='card'>
                                    <h3>Other actions</h3>
                                    <div className='ticketActions'>
                                        <div>Open the chat with the customer</div>
                                        <Button>Chat</Button>
                                    </div>
                                    <div className='ticketActions'>
                                        <div>Show as pdf</div>
                                        <Button>Print invoice</Button>
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

export const TicketDescription = ({ ticket }: { ticket: Ticket }) => {
    return (
        <Descriptions bordered size='small' layout='vertical' title={`Ticket#${ticket.id} Info`}>
            <Descriptions.Item label='Created at'>{dateFormat(ticket.timestamp, dateTimeMask)}</Descriptions.Item>
            <Descriptions.Item label='Deadline'>{dateFormat(ticket.deadline, dateTimeMask)}</Descriptions.Item>
            <Descriptions.Item label='Status'>{ticket.status}</Descriptions.Item>
            <Descriptions.Item label='Location'>{ticket.deviceLocation}</Descriptions.Item>
            {ticket.client && <Descriptions.Item label='Client'>
                {ticket.client.fullName} {ticket.client.email}
            </Descriptions.Item>
            }
            <Descriptions.Item label='Problem'>{ticket.problemExplanation}</Descriptions.Item>
            <Descriptions.Item label='Customer Request'>{ticket.customerRequest}</Descriptions.Item>
            <Descriptions.Item label='Created by'>{ticket.createdBy.fullName}</Descriptions.Item>
            <Descriptions.Item label='Payment'>
                {ticket.deposit && `Deposit: ${ticket.deposit?.toFixed(2)}`}
                <br />
                {ticket.totalPrice && `Total price: ${ticket.totalPrice?.toFixed(2)}`}
            </Descriptions.Item>
            <Descriptions.Item label='Notes'>{ticket.notes}</Descriptions.Item>

            <Descriptions.Item label='Device Info'>
                {ticket.deviceModel && `Device model: ${ticket.deviceModel}`}
                <br />
                {ticket.deviceBrand && `Device brand: ${ticket.deviceBrand}`}
                <br />
                {ticket.deviceCondition && `Condition: ${ticket.deviceCondition}`}
                <br />
                {ticket.devicePassword && `Password: ${ticket.devicePassword}`}
                <br />
                {ticket.serialNumberOrImei && `Serial number / Imei: ${ticket.serialNumberOrImei}`}
                <br />
                {ticket.accessories && `Accessories: ${ticket.accessories}`}
                <br />
            </Descriptions.Item>
        </Descriptions>
    )
}
