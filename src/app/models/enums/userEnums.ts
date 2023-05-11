import { ItemPropertyView } from '../interfaces/generalModels'
import { TourProps } from 'antd'
import { MutableRefObject } from 'react'

export type Role = 'ADMIN' | 'CLIENT' | 'SALESMAN' | 'ENGINEER'
export const UserRoles = Array('ADMIN', 'CLIENT', 'SALESMAN', 'ENGINEER')
export const UserRolesArray: ItemPropertyView[] = Array('ADMIN', 'CLIENT', 'SALESMAN', 'ENGINEER').map(
    (value, index) => ({
        id: index,
        value,
    })
)

export const userTourSteps = (refs: MutableRefObject<any>[]): TourProps['steps'] => {
    return refs
        ? [
              {
                  title: 'Users page',
                  description: 'This is the users page. You can view and edit all users on the platform here. ',
                  target: () => refs[0].current,
              },
              {
                  title: 'Creating a user',
                  description: 'Click this button and fill with information about the user.',
                  type: 'default',
                  target: () => refs[1].current,
              },
              {
                  title: 'View the saved information',
                  description: "Double click on a row to open a modal with the user's information.",
                  type: 'default',
                  target: () => refs[2].current,
              },
              {
                  title: 'Other Actions',
                  description: 'Edit the existing users through these actions.',
                  type: 'default',
                  target: () => refs[3].current,
              },
          ]
        : []
}
export const clientsTourSteps = (refs: MutableRefObject<any>[]): TourProps['steps'] => {
    return [
              {
                  title: 'Clients page',
                  description: 'This is the clients page. You can view and edit all clients of the store here. ',
                  target: () => refs[0].current,
              },
              {
                  title: 'Creating a new client',
                  description: 'Click this button and fill the form with information about the user.',
                  type: 'default',
                  target: () => refs[1].current,
              },
              {
                  title: 'View the saved information',
                  description: "Double click on a row to open a modal with the user's information.",
                  type: 'default',
                  target: () => refs[2].current,
              },
              {
                  title: 'Other Actions',
                  description: 'Edit the existing users through these actions.',
                  type: 'default',
                  target: () => refs[3].current,
              },
          ]
}

export const welcomePageTourSteps = (refs: MutableRefObject<any>[], shopName?: string): TourProps['steps'] => {
    return [
        {
            title: `Welcome to ${shopName}!`,
            description:
                'After logging in to our website, we want to provide you with a seamless and personalized experience. In addition to accessing your repair tickets, here are a few other features and information that we can offer our valued customers:',
            // cover: ,
            type: 'primary',
            target: () => refs[0].current,
        },
        {
            title: 'Repair Ticket Status:',
            description:
                " You'll be able to view the status of your repair tickets here. This includes real-time updates on the progress of your device repair, estimated completion times, and any additional notes from our technicians. You can track the journey of your phone from the moment it arrives at our shop until it's ready for pick-up.",
            type: 'default',
            target: () => refs[1].current,
        },
        {
            title: 'Repair History: ',
            type: 'default',
            description:
                'Our system keeps a record of all your past repairs, allowing you to access and review the history of services provided to your devices. This feature can be useful for reference, warranty claims, or future repairs.',
            target: () => refs[2].current,
        },
    ]
}
