import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/authSlice';
import { AiOutlineLogout } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";

import { toast } from 'react-toastify';


import { Button, Modal, Space } from 'antd';
import { getUserProfile } from '../../redux/thunks/userThunk';
import { Navigate } from 'react-router-dom';
import PostMeComponent from './PostMeComponent';
const { confirm } = Modal;


const MorePageIndex = ({ userPeople }) => {

    console.log(userPeople)

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
        <>
            <div className='container_more_page' style={userPeople.isMe ?  {} : {display:"block"}}>


                <Modal
                    title={`Bạn quyến định đăng xuất tài khoản ${userPeople.username} ?`}
                    open={open}
                    onOk={handleLogout}
                    onCancel={hideModal}
                    okText={"Đăng xuất"}
                    cancelText="Không"
                    className='modal_confilm_logout'
                >
                </Modal>


                <div style={{width:"100%"}}>
                    <div className='box_account_more'>
                        <div className='box_image_avt'>
                            <img src={userPeople.profilePicture} alt="avatar" className='image_avatar' />
                        </div>
                        <div className='box_info_me'>
                            <div id="user_name">@{userPeople.username}</div>
                            <div id="line_social">
                                <div>
                                {userPeople.posts && userPeople.posts.length ? userPeople.posts.length : 0} bài viết

                                </div>
                                <div>
                                {userPeople.followers && userPeople.followers.length ? userPeople.followers.length : 0} người theo dõi
                                </div>
                                <div>
                                    Đang theo dõi  {userPeople.following && userPeople.following.length ? userPeople.following.length : 0} người dùng
                                </div>
                            </div>
                            <div id="">{userPeople.name}</div>
                            {/* <div>{userPeople.isMe ? "là tôi" : "người khác"}</div> */}

                        </div>


                    </div>



                    <PostMeComponent />



                </div>



                {userPeople.isMe ?

                    <div className='box_select_more'>
                        <button>
                            <IoSettingsOutline />
                            <span>Cập nhật</span>

                        </button>
                        <button onClick={showModal}>
                            <AiOutlineLogout />
                            <span>Đăng xuất</span>
                        </button>

                    </div>


                    : ""}



            </div>
        </>
    )
}

export default MorePageIndex