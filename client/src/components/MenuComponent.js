import React, { useState } from 'react'
import { RiHome3Fill } from 'react-icons/ri';
import { IoSearch } from "react-icons/io5";
import { IoChatbubblesOutline } from "react-icons/io5";
import { CgMoreO} from "react-icons/cg";
import { NavLink, useLocation } from 'react-router-dom';
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaRegPenToSquare } from "react-icons/fa6";
import PostModal from '../pages/postPages/PostModal';

const logo_text = require("../assets/logo/text_logo.png");
const logo_icon = require("../assets/logo/icon_logo.png");

const MenuComponent = ({ userCheck }) => {
    const [isPostModalVisible, setIsPostModalVisible] = useState(false);

    const ARRAY_LIST_MENU = [
        {
            id: 0,
            role: "",
            name_menu: 'Trang chủ',
            icon_before: <RiHome3Fill />,
            to_link: '/',
            submenu: false,
            isModal: false,
        },
        {
            id: 1,
            role: "",
            name_menu: 'Đăng bài',
            icon_before: <FaRegPenToSquare />,
            to_link: null,
            submenu: false,
            isModal: true,
        },
        {
            id: 2,
            role: "",
            name_menu: 'Tìm kiếm',
            icon_before: <IoSearch />,
            to_link: '/search',
            submenu: false,
            isModal: false,
        },
        {
            id: 3,
            role: "",
            name_menu: 'Tin nhắn',
            icon_before: <IoChatbubblesOutline />,
            to_link: '/chat',
            submenu: false,
            isModal: false,
        },
        {
            id: 4,
            role: "",
            name_menu: 'Thông báo',
            icon_before: <IoMdNotificationsOutline />,
            to_link: '/notification',
            submenu: false,
            isModal: false,
        },
        {
            id: 5,
            role: "",
            name_menu: 'Trang cá nhân',
            icon_before: <CgMoreO />,
            to_link: `/${userCheck.username}`,
            submenu: true,
            isIconImage: true,
            isModal: false,
        },
    ];

    const location = useLocation();
    const getRouteName = location.pathname.split("/")[1];
    const setMenuBar = getRouteName === "chat";

    const handleMenuClick = (item) => {
        if (item.isModal) {
            setIsPostModalVisible(true);
            return;
        }
    };

    const render_menu = () => {
        return ARRAY_LIST_MENU.map((item) => (
            item.isModal ? (
                <div 
                    key={item.id} 
                    className="menu-item"
                    onClick={() => handleMenuClick(item)}
                >
                    <div className='icon_menu'>{item.icon_before}</div>
                    <div className='name_menu'>{item.name_menu}</div>
                </div>
            ) : (
                <NavLink 
                    to={item.to_link} 
                    key={item.id}
                    className={({ isActive }) => isActive ? 'active' : ''}
                >
                    {item.isIconImage ? (
                        <img 
                            src={userCheck.profilePicture} 
                            alt={userCheck.name}
                            className='img_icon_menu' 
                        />
                    ) : (
                        <div className='icon_menu'>{item.icon_before}</div>
                    )}
                    <div className='name_menu'>{item.name_menu}</div>
                </NavLink>
            )
        ));
    };

    return (
        <>
            <div className={`container_menu ${setMenuBar ? "set_width_menu_chat" : ""}`}>
                <div className='box_logo_menu'>
                    <a href="/">
                        <img 
                            src={setMenuBar ? logo_icon : logo_text} 
                            alt="logo" 
                            className='img_text_logo_menu' 
                        />
                    </a>
                </div>
                <div>
                    {render_menu()}
                </div>
            </div>
            
            <PostModal 
                visible={isPostModalVisible}
                onClose={() => setIsPostModalVisible(false)} 
                user={userCheck}
            />
        </>
    );
};

export default MenuComponent;