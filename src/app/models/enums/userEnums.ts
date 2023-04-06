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
                  title: 'Creating a user',
                  description: 'Click this button and fill with information about the user.',
                  // cover: (),
                  target: () => refs[0].current,
              },
              {
                  title: 'View the saved information',
                  description: "Double click on a row to open a modal with the user's information.",
                  target: () => refs[1].current,
              },
              {
                  title: 'Other Actions',
                  description: 'Edit the existing users through these actions.',
                  target: () => refs[2].current,
              },
          ]
        : []
}
