import React from 'react'

import { RiHome3Fill } from 'react-icons/ri';
import { IoSearch } from "react-icons/io5";
import { IoChatbubblesOutline } from "react-icons/io5";
import { CgMoreO } from "react-icons/cg";
import { Link, NavLink } from 'react-router-dom';
import { IoMdNotificationsOutline } from "react-icons/io";

import { FaRegPenToSquare } from "react-icons/fa6";

const logo_text = require("../assets/logo/text_logo.png")




const MenuComponent = ({ userCheck }) => {


    console.log("menu " + JSON.stringify(userCheck, null, 2));


    const ARRAY_LIST_MENU = [
        {
            id: 0,
            role: "",
            name_menu: 'Trang chủ',
            icon_before: <RiHome3Fill />,
            to_link: '/',
            submenu: false,
        },
        {
            id: 1,
            role: "",
            name_menu: 'Đăng bài',
            icon_before: <FaRegPenToSquare />,
            to_link: '/post',
            submenu: false,
        },
        {
            id: 2,
            role: "",
            name_menu: 'Tìm kiếm',
            icon_before: <IoSearch />,
            to_link: '/search',
            submenu: false,
        },
        {
            id: 3,
            role: "",
            name_menu: 'Tin nhắn',
            icon_before: <IoChatbubblesOutline />,
            to_link: '/chat',
            submenu: false,
        },
        {
            id: 4,
            role: "",
            name_menu: 'Thông báo',
            icon_before: <IoMdNotificationsOutline />,
            to_link: '/notification',
            submenu: false,
        },
        {
            id: 5,
            role: "",
            name_menu: 'Cá nhân',
            icon_before: <CgMoreO />,
            to_link: `/${userCheck.username}`,
            submenu: true,
        },
    ];


    const render_menu = ARRAY_LIST_MENU.map((index) => {
        return (
            <div key={index.id}>
                <NavLink to={index.to_link}>
                    <div className='icon_menu'>{index.icon_before}</div>
                    <div className='name_menu'>{index.name_menu}</div>
                </NavLink>
            </div>
        )
    })


    return (
        <div className='container_menu'>
            <div className='box_logo_menu'>
                <Link to="/">
                    <img src={logo_text} alt="logo text" className='img_text_logo_menu' />
                </Link>
            </div>
            {render_menu}
        </div>
    )
}

export default MenuComponent