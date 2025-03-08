import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './authPages/LoginPage'
import RegisterPage from './authPages/RegisterPage'
import NotFoundPages from './chatPages/NotFoundPages'
import ChatPageIndex from './chatPages/ChatPageIndex'
import LayoutIndex from './LayoutIndex'

const auth = false;


const MainView = () => {
    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={auth ? <LayoutIndex /> : <Navigate to="/login" />} >
                    <Route path="*" element={<NotFoundPages />} />
                </Route>

            </Routes>
        </>
    )
}

export default MainView