import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/authPages/LoginPage'
import RegisterPage from '../pages/authPages/RegisterPage'
import NotFoundPages from '../pages/chatPages/NotFoundPages'
import ChatPageIndex from '../pages/chatPages/ChatPageIndex'
import LayoutIndex from '../pages/LayoutIndex'
import RequireAuth from '../middlewares/RequireAuth'
import { useSelector } from 'react-redux'
import { Bounce, ToastContainer } from 'react-toastify'

const auth = false;

export const ProtectedAuth = ({ component }) => {
    const { token } = useSelector(state => state.auth);
    return token ? <Navigate to="/" /> : component;
};

const MainView = () => {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
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
                    <Route path="/" element={<LayoutIndex />} />
                    <Route path="*" element={<Navigate to="/"/>} />
                </Route>

                {/* Redirect tất cả trang không tìm thấy về Home */}
                <Route path="*" element={<NotFoundPages/>} />

            </Routes>
        </>
    )
}

export default MainView