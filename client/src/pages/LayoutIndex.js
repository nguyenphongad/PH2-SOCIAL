import React from 'react'
import MenuComponent from '../components/MenuComponent'
import { Outlet } from 'react-router-dom'

const LayoutIndex = ({userCheck}) => {
    return (
        <div className='container_layout_main'>
            <div>
                <MenuComponent userCheck={userCheck}/>
            </div>
            <div className='box_outlet_main'>
                <Outlet />
            </div>
        </div>
    )
}

export default LayoutIndex