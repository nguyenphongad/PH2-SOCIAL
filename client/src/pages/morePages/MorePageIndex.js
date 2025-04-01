import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';

import Logo_icon from "../../assets/logo/icon_logo.png"

// slice
import { logout } from '../../redux/slices/authSlice';
import { updateFollowers } from '../../redux/slices/userSlice';
import { setIsFollowing } from '../../redux/slices/socialSlice';

// thunk
import { checkFollowStatus, followUser } from '../../redux/thunks/socialThunk';
import { getShowListFollowerUser, getUserProfile } from '../../redux/thunks/userThunk';

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
import { FcEmptyBattery } from "react-icons/fc";

// ant
import { Button, Modal, Space } from 'antd';
import LoadingText from '../../components/loadingComponent.js/LoadingText';
const { confirm } = Modal;




const MorePageIndex = ({ userPeople }) => {

    // dispatch
    const dispatch = useDispatch();

    // state
    const [open, setOpen] = useState(false);
    const [openModalSelect, setOpenModalSelect] = useState(false);
    const [isOpenModelFollower, setOpenModelFollower] = useState(false);


    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);



    // selector
    const { token } = useSelector((state) => state.auth);

    const { user, userFollower } = useSelector((state) => state.user);

    const isLogin = useSelector((state) => state.auth.isLogin);
    const { isFollowing } = useSelector((state) => state.social);


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


            // const currentFollowingCount = user?.following?.length || 0;
            // const currentPostCount = user?.posts?.length || 0;
            // dispatch(updatePostCount(currentPostCount));
            // dispatch(updateFollowing(currentFollowingCount));


            dispatch(updateFollowers(currentFollowerCount));

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
            setIsProcessing(false);
        }
    };

    if (!isLogin) {
        return null;
    }

    // handle open modal list following 
    const handleOpenListFollowing = () => {
        if (isLoadingFollowers) return;

        setIsLoadingFollowers(true);

        dispatch(getShowListFollowerUser(user?.followers))
            .unwrap()
            .then(() => {
                setOpenModelFollower(true);
            })
            .catch((error) => {
                console.error("Lỗi khi lấy danh sách follower:", error);
            })
            .finally(() => {
                setIsLoadingFollowers(false);
            });

    }




    return (
        <>
            <div className='container_more_page' style={userPeople.isMe ? {} : { display: "block" }}>
                <Modal
                    title={`Bạn quyến định đăng xuất tài khoản ${userPeople.username} ?`}
                    open={open}
                    onOk={handleLogout}
                    onCancel={() => setOpen(false)}
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
                    className='modal_select_user'
                >
                    <div className='container_column_select'>
                        <button style={{ color: "red" }}>
                            Chặn
                        </button>
                        <button style={{ color: "red" }}>
                            Báo cáo
                        </button>
                        <button>
                            Chia sẻ
                        </button>

                    </div>
                </Modal>


                <Modal
                    title={"NGƯỜI THEO DÕI"}
                    open={isOpenModelFollower}
                    onCancel={() => setOpenModelFollower(false)}
                    okText={null}
                    cancelText={null}
                    footer={null}
                    className='modal_fler_user'
                >
                    {userFollower === null || userFollower.data.length===0 ? (
                        <div style={{textAlign:"center"}}>
                            <FcEmptyBattery size={70}/>
                            <h3>Danh sách người theo dõi trống</h3>
                        </div>
                    ) :
                        userFollower.data.map((index) => (
                            <div key={index.userID} className='item_user_fler'>
                                <Link to={`../${index.username}`} onClick={() => setOpenModelFollower(false)}>
                                    <img src={index.profilePicture} />
                                </Link>
                                <div>
                                    <Link 
                                    to={`../${index.username}`} 
                                    onClick={() => setOpenModelFollower(false)}
                                    className='st_username_user'
                                    > @{index.username}</Link>
                                    <div> {index.name}</div>
                                </div>



                            </div>
                        ))


                    }



                </Modal>


                <div style={{ width: "100%" }}>
                    <div className='box_account_more'>
                        <div className='box_image_avt'>
                            <img src={userPeople.profilePicture} alt="avatar" className='image_avatar' />
                            <img src={Logo_icon} alt="logo icon" className='logo_icon_pos' />
                        </div>
                        <div className='box_info_me'>
                            <div id="user_name">@{userPeople.username}</div>
                            <div id="line_social">
                                <div>
                                    <span className='output_total'>
                                        {user?.posts?.length ?? <LoadingText size={10} color={"#000"} />}
                                    </span>
                                    <span> bài viết</span>
                                </div>
                                <div onClick={handleOpenListFollowing}>
                                    <span className='output_total'>
                                        {user?.followers?.length ?? <LoadingText size={10} color={"#000"} />}
                                    </span>
                                    <span> người theo dõi</span>
                                </div>
                                <div>
                                    <span className='output_total' >
                                        {user?.following?.length ?? <LoadingText size={10} color={"#000"} />}
                                    </span>
                                    <span>đang theo dõi</span>
                                </div>
                            </div>
                            <div id="name_user">{userPeople.name}</div>
                            <div id="bio_user">{userPeople.bio}</div>
                            <div>{
                                userPeople.isMe ? "" :
                                    <div className='line_btn_sl'>

                                        <button onClick={handleFollowUser} disabled={isProcessing} className={isFollowing ? "bgr_fled" : ""}>
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


                        <div className='box_select_more'>
                            {userPeople.isMe ?
                                (
                                    <>
                                        <button>
                                            <IoSettingsOutline />
                                            <span>Cập nhật</span>

                                        </button>
                                        <button onClick={() => setOpen(true)}>
                                            <AiOutlineLogout />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </>
                                )

                                : ""}
                        </div>



                    </div>


                    <PostMeComponent />



                </div>






            </div>
        </>
    )
}

export default MorePageIndex