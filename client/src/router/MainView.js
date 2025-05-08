import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import LoginPage from '../pages/authPages/LoginPage'
import RegisterPage from '../pages/authPages/RegisterPage'
import NotFoundPages from '../pages/authPages/NotFoundPages'
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
import CreatePostPage from '../pages/postPages/CreatePostPage'
import { checkToken } from '../redux/thunks/authThunk'
import { getUserProfile } from '../redux/thunks/userThunk'



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
    const { token } = useSelector((state) => state.auth);

    const location = useLocation();  // Lấy đường dẫn hiện tại
    const username = location.pathname.split("/")[1];


    const dispatch = useDispatch();

    const [userCheck, setUserCheck] = useState("");
    const [userPeople, setUserPeople] = useState({});
    const [isUserLoaded, setIsUserLoaded] = useState(false);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (token) {
                const resultAction = await dispatch(checkToken(token));
                if (checkToken.fulfilled.match(resultAction)) {
                    setUserCheck(resultAction.payload.user);

                    // console.log("userCheck " + userCheck)

                } else {
                    console.log('Error during token check');

                }
            }
        };

        fetchCurrentUser();
    }, [token, dispatch]);


    const routesConfig = [
        { path: "/", component: <HomePageIndex />, requiresAuth: true },
        { path: "/post", component: <CreatePostPage />, requiresAuth: true },
        { path: "/search", component: <SearchPageIndex />, requiresAuth: true },
        { path: "/chat", component: <ChatPageIndex userCheck={userCheck}/>, requiresAuth: true },
        { path: "/chat/:id", component: <ChatPageIndex userCheck={userCheck}/>, requiresAuth: true },
        { path: "/notification", component: <NoticationPageIndex />, requiresAuth: true },
        { path: "/404", component: <NotFoundPages /> },
    ];

    const getPath = routesConfig.map((route) => route.path);


    // Fetch thông tin người dùng được truy cập (nếu có username trong URL)
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (token && username && !getPath.includes(`/${username}`)) {
                const action = await dispatch(getUserProfile(username, token));
                if (getUserProfile.fulfilled.match(action)) {
                    const profile = action.payload;
                    setUserPeople({
                        ...profile,
                        isMe: profile.username === userCheck?.username
                    });
                } else {
                    console.log("Error fetching user profile");
                    setUserPeople(action.payload);
                }
                setIsUserLoaded(true);
            }
        };

        fetchUserProfile();

    }, [token, username, userCheck, dispatch, location.pathname]);


    // if (status === "loading") {
    //     return <div>Đang kiểm tra token...</div>;
    // }


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
                    <Route path="/" element={<LayoutIndex userCheck={userCheck} />} >

                        {routesConfig.map((route, index) => {
                            return <Route key={index} path={route.path} element={route.component} />;
                        })}

                        <Route path="/chat/:id" element={<ChatPageIndex userCheck={userCheck} />} />


                        {username && (
                            <Route
                                path={`/${username}`}
                                element={userPeople.isNotFoud ? <NotFoundPages /> : <MorePageIndex userPeople={userPeople} />}
                            />
                        )}

                        <Route path="*" element={<NotFoundPages />} />

                    </Route>
                </Route>

                {/* Redirect tất cả trang không tìm thấy về Home */}
                <Route path="*" element={<NotFoundPages />} />

            </Routes>

        </>
    )
}

export default MainView