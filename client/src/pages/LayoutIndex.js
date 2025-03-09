import React from 'react'
import MenuComponent from '../components/MenuComponent'
import { Outlet } from 'react-router-dom'

const LayoutIndex = () => {
    return (
        <div className='container_layout_main'>
            <div>
                <MenuComponent />
            </div>
            <div className='box_outlet_main'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutIndex