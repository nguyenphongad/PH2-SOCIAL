import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom';
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
import ProfileSkeleton from './ProfileSkeleton';

//react icon
import { AiOutlineLogout } from "react-icons/ai";
import { IoSettingsOutline } from "react-icons/io5";
import { MdMoreHoriz } from "react-icons/md";
import { SlUserFollow } from "react-icons/sl";
import { IoIosSend } from "react-icons/io";
import { RiUserUnfollowLine } from "react-icons/ri";
import { FcEmptyBattery } from "react-icons/fc";
import { FaUserCircle, FaRegEdit } from "react-icons/fa";
import { IoCameraSharp } from "react-icons/io5";

// ant
import { Modal } from 'antd';

const MorePageIndex = ({ userPeople }) => {
    // state
    const [open, setOpen] = useState(false);
    const [openModalSelect, setOpenModalSelect] = useState(false);
    const [isOpenModelFollower, setOpenModelFollower] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // Không cần active tab nữa vì chỉ còn 1 tab
    const [activeTab, setActiveTab] = useState('posts');

    // dispatch & selectors
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { user, userFollower } = useSelector((state) => state.user);
    const isLogin = useSelector((state) => state.auth.isLogin);
    const { isFollowing } = useSelector((state) => state.social);

    // get username from URL
    const get_username = useLocation().pathname;
    const username = get_username.substring(1);

    // Check follow status on mount and when username changes
    useEffect(() => {
        if (username) {
            dispatch(checkFollowStatus(username));
        }
        
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        
        return () => clearTimeout(timer);
    }, [username, dispatch]);

    // handle logout
    const handleLogout = () => {
        setTimeout(() => {
            dispatch(logout());
            toast.warning("Đã đăng xuất!")
        }, 1000);
    }

    // handle follow/unfollow
    const handleFollowUser = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const flUser = await dispatch(followUser(username, token));
            if (flUser) {
                dispatch(getUserProfile(username, token));
            }
            const currentFollowerCount = user?.followers?.length || 0;
            dispatch(updateFollowers(currentFollowerCount));
            dispatch(setIsFollowing(!isFollowing));

            if (isFollowing) {
                toast.warning('Bỏ follow thành công!');
            } else {
                toast.success('Follow thành công!');
            }
        } catch (error) {
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại!');
        } finally {
            setIsProcessing(false);
        }
    };

    // handle open follower list modal
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

    // early return if not logged in
    if (!isLogin) return null;

    return (
        <>
            <div className={`container_more_page ${userPeople.isMe ? 'is-me' : 'is-other'}`}>
                {/* Logout Confirmation Modal */}
                <Modal
                    title="Xác nhận đăng xuất"
                    open={open}
                    onCancel={() => setOpen(false)}
                    className='custom-modal logout-modal'
                    centered
                    footer={null}
                    closable={false}
                >
                    <p>Bạn có chắc muốn đăng xuất khỏi tài khoản <strong>@{userPeople.username}</strong>?</p>
                    <div>
                        <button className="btn-cancel" onClick={() => setOpen(false)}>Hủy</button>
                        <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
                    </div>
                </Modal>

                {/* User Actions Modal */}
                <Modal
                    title={`Tùy chọn với ${userPeople.username}`}
                    open={openModalSelect}
                    onCancel={() => setOpenModalSelect(false)}
                    footer={null}
                    className='custom-modal'
                    centered
                >
                    <div className='action-menu'>
                        <button className="action-btn danger">
                            <span className="icon">⊘</span>
                            <span className="text">Chặn người dùng</span>
                        </button>
                        <button className="action-btn warning">
                            <span className="icon">⚠</span>
                            <span className="text">Báo cáo tài khoản</span>
                        </button>
                        <button className="action-btn">
                            <span className="icon">↗</span>
                            <span className="text">Chia sẻ trang cá nhân</span>
                        </button>
                    </div>
                </Modal>

                {/* Followers Modal */}
                <Modal
                    title="NGƯỜI THEO DÕI"
                    open={isOpenModelFollower}
                    onCancel={() => setOpenModelFollower(false)}
                    footer={null}
                    className='custom-modal followers-modal'
                    centered
                >
                    {userFollower === null || userFollower?.data?.length === 0 ? (
                        <div className="empty-state">
                            <FcEmptyBattery size={70} />
                            <h3>Danh sách người theo dõi trống</h3>
                        </div>
                    ) : (
                        <div className="followers-list">
                            {userFollower?.data?.map((follower) => (
                                <div key={follower.userID} className='follower-item'>
                                    <Link to={`../${follower.username}`} onClick={() => setOpenModelFollower(false)}>
                                        <img src={follower.profilePicture} alt={follower.name} />
                                    </Link>
                                    <div className="follower-info">
                                        <Link
                                            to={`../${follower.username}`}
                                            onClick={() => setOpenModelFollower(false)}
                                            className='username'
                                        >
                                            @{follower.username}
                                        </Link>
                                        <div className="name">{follower.name}</div>
                                    </div>
                                    <button className="follow-btn">Theo dõi</button>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>

                {/* Profile Content */}
                <div className="profile-container">
                    {isLoading ? (
                        <ProfileSkeleton isMe={userPeople.isMe} />
                    ) : (
                        <>
                            {/* Profile Header */}
                            <div className='profile-header'>
                                <div className='profile-avatar-container'>
                                    <img src={userPeople.profilePicture} alt="avatar" className='profile-avatar' />
                                </div>
                                
                                <div className='profile-info'>
                                    <div className="profile-username">@{userPeople.username}</div>
                                    
                                    <div className="profile-stats">
                                        <div className="stat-item">
                                            <span className="stat-count">{user?.posts?.length || 0}</span>
                                            <span className="stat-label">bài viết</span>
                                        </div>
                                        
                                        <div className="stat-item" onClick={handleOpenListFollowing}>
                                            <span className="stat-count">{user?.followers?.length || 0}</span>
                                            <span className="stat-label">người theo dõi</span>
                                        </div>
                                        
                                        <div className="stat-item">
                                            <span className="stat-count">{user?.following?.length || 0}</span>
                                            <span className="stat-label">đang theo dõi</span>
                                        </div>
                                    </div>
                                    
                                    <div className="profile-name">{userPeople.name}</div>
                                    <div className="profile-bio">{userPeople.bio || "Chưa có thông tin giới thiệu"}</div>
                                    
                                    {/* Action buttons - different for own profile vs others */}
                                    <div className="profile-actions">
                                        {userPeople.isMe ? (
                                            <>
                                                <button className="action-button primary">
                                                    <FaRegEdit className="white-icon" /> Chỉnh sửa trang cá nhân
                                                </button>
                                                <button className="action-button secondary" onClick={() => setOpen(true)}>
                                                    <AiOutlineLogout /> Đăng xuất
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={handleFollowUser} 
                                                    disabled={isProcessing} 
                                                    className={`action-button ${isFollowing ? 'outlined' : 'primary'}`}
                                                >
                                                    {isProcessing ? (
                                                        <LoadingButton size={18} color={isFollowing ? 'outlined' : 'primary'} />
                                                    ) : isFollowing ? (
                                                        <>
                                                            <RiUserUnfollowLine className='icon_unfl'/> Hủy theo dõi
                                                        </>
                                                    ) : (
                                                        <>
                                                            <SlUserFollow  className='icon_fl'/> Theo dõi
                                                        </>
                                                    )}
                                                </button>
                                                
                                                <button className="action-button secondary">
                                                    <Link to={`/chat/${userPeople.userID}`}>
                                                        <IoIosSend /> Nhắn tin
                                                    </Link>
                                                </button>
                                                
                                                <button className="action-button icon-only" onClick={() => setOpenModalSelect(true)}>
                                                    <MdMoreHoriz />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Profile Tabs - Chỉ giữ lại tab Bài viết */}
                            <div className="profile-tabs">
                                <button 
                                    className="tab-button active"
                                >
                                    <IoCameraSharp className="tab-icon" /> Bài viết
                                </button>
                            </div>
                            
                            {/* Content - Luôn hiển thị PostMeComponent */}
                            <div className="tab-content">
                                <PostMeComponent username={userPeople.username} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default MorePageIndex;