import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/authPages/LoginPage'
import RegisterPage from '../pages/authPages/RegisterPage'
import NotFoundPages from '../pages/chatPages/NotFoundPages'
import ChatPageIndex from '../pages/chatPages/ChatPageIndex'
import LayoutIndex from '../pages/LayoutIndex'
import RequireAuth from '../middlewares/RequireAuth'
import { useDispatch, useSelector } from 'react-redux'
import { Bounce, ToastContainer } from 'react-toastify'

import { logout } from "../redux/slices/authSlice";
import SearchPageIndex from '../pages/searchPages/SearchPageIndex'
import MorePageIndex from '../pages/morePages/MorePageIndex'
import HomePageIndex from '../pages/homePages/HomePageIndex'
import NoticationPageIndex from '../pages/notificationPages/NoticationPageIndex'
import PostPageIndex from '../pages/postPages/PostPageIndex'

export const ProtectedAuth = ({ component }) => {
    const { token } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!token) {
            dispatch(logout());
        }
    }, [token, dispatch]);

    return token ? <Navigate to="/" /> : component;
};

const MainView = () => {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <Routes>
                {/* Nếu đã đăng nhập, không cho phép vào Login/Register */}
                <Route path="/login" element={<ProtectedAuth component={<LoginPage />} />} />
                <Route path="/register" element={<ProtectedAuth component={<RegisterPage />} />} />

                {/* Các route yêu cầu đăng nhập */}
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<LayoutIndex />} >
                        <Route path="/" element={<HomePageIndex />} />
                        <Route path="/post" element={<PostPageIndex />} />
                        <Route path="/search" element={<SearchPageIndex />} />
                        <Route path="/chat" element={<ChatPageIndex />} />
                        <Route path="/notification" element={<NoticationPageIndex />} />
                        <Route path="/more" element={<MorePageIndex />} />
                    </Route>
                    <Route path="*" element={<NotFoundPages />} />
                </Route>

                {/* Redirect tất cả trang không tìm thấy về Home */}
                <Route path="*" element={<NotFoundPages />} />

            </Routes>
        </>
    )
}

export default MainView