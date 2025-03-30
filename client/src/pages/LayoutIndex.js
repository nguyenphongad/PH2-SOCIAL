import React from 'react'
import MenuComponent from '../components/MenuComponent'
import { Outlet } from 'react-router-dom'

const LayoutIndex = ({ userCheck }) => {
    return (
        <div className='container_layout_main'>
            <MenuComponent userCheck={userCheck} />
            <div className='box_outlet_main'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutIndex