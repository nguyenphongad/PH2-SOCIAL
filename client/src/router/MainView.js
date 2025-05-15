import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
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
import PostPageIndex from '../pages/postPages/PostPageIndex'
import { checkToken } from '../redux/thunks/authThunk'
import { getUserProfile } from '../redux/thunks/userThunk'
import PostDetailPage from '../pages/postPages/PostDetailPage'

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
    const location = useLocation();
    const background = location.state?.background;
    
    // Lấy username từ URL để xác định route cho profile
    const pathParts = location.pathname.split("/");
    const firstPathPart = pathParts[1];
    const isPostRoute = firstPathPart === "post";
    const username = !isPostRoute && firstPathPart && 
                  !["search", "chat", "notification", "login", "register", "404"].includes(firstPathPart) 
                  ? firstPathPart : "";

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
                } else {
                    console.log('Error during token check');
                }
            }
        };

        fetchCurrentUser();
    }, [token, dispatch]);

    // Danh sách các route cố định trong ứng dụng
    const routesConfig = [
        { path: "/", component: <HomePageIndex /> },
        { path: "/post", component: <PostPageIndex /> },
        { path: "/post/:postId", component: <PostDetailPage /> },
        { path: "/search", component: <SearchPageIndex /> },
        { path: "/chat", component: <ChatPageIndex userCheck={userCheck}/> },
        { path: "/chat/:id", component: <ChatPageIndex userCheck={userCheck}/> },
        { path: "/notification", component: <NoticationPageIndex /> },
    ];

    // Lấy danh sách path từ routesConfig
    const staticPaths = routesConfig.map(route => route.path.split('/')[1]);

    // Fetch thông tin người dùng được truy cập (nếu có username trong URL)
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (token && username) {
                try {
                    const action = await dispatch(getUserProfile(username, token));
                    if (getUserProfile.fulfilled.match(action)) {
                        const profile = action.payload;
                        setUserPeople({
                            ...profile,
                            isMe: profile.username === userCheck?.username
                        });
                    } else {
                        console.log("Error fetching user profile");
                        setUserPeople({
                            ...action.payload,
                            isNotFound: true
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    setUserPeople({ isNotFound: true });
                } finally {
                    setIsUserLoaded(true);
                }
            }
        };

        if (username) {
            fetchUserProfile();
        }
    }, [token, username, userCheck, dispatch]);

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

            {/* 
              * Nếu có background state (chuyển từ trang khác -> hiện modal),
              * sử dụng location từ background để render trang bên dưới modal.
              * Nếu không, sử dụng location hiện tại.
              */}
            <Routes location={background || location}>
                {/* Nếu đã đăng nhập, không cho phép vào Login/Register */}
                <Route path="/login" element={<ProtectedAuth component={<LoginPage />} />} />
                <Route path="/register" element={<ProtectedAuth component={<RegisterPage />} />} />

                {/* Các route yêu cầu đăng nhập */}
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<LayoutIndex userCheck={userCheck} />}>
                        {/* Các route cố định */}
                        {routesConfig.map((route, index) => (
                            <Route key={index} path={route.path} element={route.component} />
                        ))}
                        
                        {/* Route cho profile người dùng (dynamic route) */}
                        {username && (
                            <Route 
                                path={`/${username}`}
                                element={userPeople.isNotFound ? <NotFoundPages /> : <MorePageIndex userPeople={userPeople} />}
                            />
                        )}

                        
                        
                        {/* Fallback route */}
                        <Route path="*" element={<NotFoundPages />} />
                    </Route>
                </Route>

                {/* Redirect tất cả trang không tìm thấy về Home */}
                <Route path="*" element={<NotFoundPages />} />
            </Routes>

            {/* 
              * Chỉ khi có background state (chuyển từ trang khác), 
              * render thêm route /post/:postId dưới dạng modal
              */}
            {background && (
                <Routes>
                    <Route element={<RequireAuth />}>
                        <Route path="/post/:postId" element={<PostDetailPage isModal={true} />} />
                    </Route>
                </Routes>
            )}
        </>
    )
}

export default MainView