import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation, useParams } from 'react-router-dom';

// slice
import { logout } from '../../redux/slices/authSlice';
import { updateFollowers } from '../../redux/slices/userSlice';

// thunk
import { checkFollowStatus, followUser } from '../../redux/thunks/socialThunk';

//toast
import { toast } from 'react-toastify';


// component
import PostMeComponent from './PostMeComponent';
import LoadingButton from '../../components/loadingComponent.js/LoadingButton';


//react icon
import { AiOutlineLogout } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { MdMoreHoriz } from "react-icons/md";
import { SlUserFollow } from "react-icons/sl";
import { IoIosSend } from "react-icons/io";
import { RiUserUnfollowLine } from "react-icons/ri";

// ant
import { Button, Modal, Space } from 'antd';
import { setIsFollowing } from '../../redux/slices/socialSlice';
import { getUserProfile } from '../../redux/thunks/userThunk';
const { confirm } = Modal;





const MorePageIndex = ({ userPeople }) => {

    // dispatch
    const dispatch = useDispatch();

    // state
    const [open, setOpen] = useState(false);
    const [openModalSelect, setOpenModalSelect] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);



    // selector
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.user);
    const isLogin = useSelector((state) => state.auth.isLogin);
    const { isFollowing, status } = useSelector((state) => state.social);


    // get Url pathname
    const get_username = useLocation().pathname;
    const username = get_username.substring(1);


    //E
    useEffect(() => {
        if (username) {
            dispatch(checkFollowStatus(username));
        }
    }, [username, dispatch]);



    // handles log out
    const handleLogout = () => {
        setTimeout(() => {
            dispatch(logout());
            toast.warning("Đã đăng xuất!")
        }, 1000);
    }

    // handle follow 
    const handleFollowUser = async () => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            const flUser = await dispatch(followUser(username, token));

            if (flUser) {
                dispatch(getUserProfile(username, token));
            }

            const currentFollowerCount = user?.followers?.length || 0;

            const f = dispatch(updateFollowers(currentFollowerCount));

            console.log(f)

            dispatch(setIsFollowing(!isFollowing));

            if (isFollowing) {
                toast.warning('Bỏ follow thành công!');
            } else {
                toast.success('Follow thành công!');
            }


        } catch (error) {
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại!');
            console.log(error)
        } finally {
            setIsProcessing(false); // Hoàn tất xử lý
        }
    };

    if (!isLogin) {
        return null;
    }

    const showModal = () => {
        setOpen(true);
    };
    const hideModal = () => {
        setOpen(false);
    };




    return (
        <>
            <div className='container_more_page' style={userPeople.isMe ? {} : { display: "block" }}>


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

                <Modal
                    title={"Đối với " + userPeople.username}
                    open={openModalSelect}
                    // onOk={none}
                    onCancel={() => setOpenModalSelect(false)}
                    okText={null}
                    cancelText={null}
                    footer={null}
                    className='modal_select'
                >
                    <button>
                        Chặn
                    </button>
                    <button>
                        Chia sẻ
                    </button>
                </Modal>


                <div style={{ width: "100%" }}>
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
                                    {user?.followers?.length ?? <LoadingButton size={12} color={"#000"}/>} người theo dõi
                                </div>
                                <div>
                                    Đang theo dõi  {userPeople.following && userPeople.following.length ? userPeople.following.length : 0} người dùng
                                </div>
                            </div>
                            <div id="">{userPeople.name}</div>
                            <div id="">{userPeople.bio}</div>
                            <div>{
                                userPeople.isMe ? "" :
                                    <div className='line_btn_sl'>



                                        <button onClick={handleFollowUser} disabled={isProcessing}>
                                            {isFollowing ? (
                                                <>
                                                    {isProcessing ? (
                                                        <LoadingButton size={18} />
                                                    ) : (
                                                        <>
                                                            <RiUserUnfollowLine /> HUỶ THEO DÕI
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {isProcessing ? (
                                                        <LoadingButton size={18} />
                                                    ) : (
                                                        <>
                                                            <SlUserFollow /> THEO DÕI
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </button>




                                        <button>
                                            <IoIosSend />
                                            NHẮN TIN
                                        </button>
                                        <button onClick={() => setOpenModalSelect(true)}>
                                            <MdMoreHoriz />
                                        </button>
                                    </div>

                            }</div>

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