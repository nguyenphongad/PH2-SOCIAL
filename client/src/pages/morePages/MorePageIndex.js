import React, { useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/authSlice';
import { AiOutlineLogout } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";

import { toast } from 'react-toastify';


import { Button, Modal, Space } from 'antd';
const { confirm } = Modal;


const MorePageIndex = () => {

    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const isLogin = useSelector((state) => state.auth.isLogin);


    if (!isLogin) {
        return null;
    }

    const showModal = () => {
        setOpen(true);
    };
    const hideModal = () => {
        setOpen(false);
    };



    const handleLogout = () => {
        setTimeout(() => {
            dispatch(logout());
            toast.warning("Đã đăng xuất!")
        }, 1000);
    }

    return (
        <div className='container_more_page'>


            <Modal
                title="Bạn quyến định đăng xuất tài khoản ?"
                open={open}
                onOk={handleLogout}
                onCancel={hideModal}
                okText={"Đăng xuất"}
                cancelText="Không"
                className='modal_confilm_logout'
            >
            </Modal>


            <div className='box_account_more'>
                trang ca nhan
            </div>
            <div className='box_select_more'>
                <button>
                    <IoSettingsOutline />
                    <span>Cài đặt</span>

                </button>
                <button onClick={showModal}>
                    <AiOutlineLogout />
                    <span>Đăng xuất</span>
                </button>

            </div>



        </div>
    )
}

export default MorePageIndex