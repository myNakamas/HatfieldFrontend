import React from 'react'
import { ComponentPreview, Previews } from '@react-buddy/ide-toolbox'
import { PaletteTree } from './palette'
import { ShopSettingsView } from '../app/pages/shop/ShopSettingsView'

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree />}>
            <ComponentPreview path='/ShopView'>
                <ShopSettingsView />
            </ComponentPreview>
        </Previews>
    )
}

export default ComponentPreviews
