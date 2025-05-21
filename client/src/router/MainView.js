import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, Outlet } from 'react-router-dom';
import LoginPage from '../pages/authPages/LoginPage';
import RegisterPage from '../pages/authPages/RegisterPage';
import NotFoundPages from '../pages/authPages/NotFoundPages';
import ChatPageIndex from '../pages/chatPages/ChatPageIndex';
import LayoutIndex from '../pages/LayoutIndex';
import RequireAuth from '../middlewares/RequireAuth';
import { useDispatch, useSelector } from 'react-redux';
import { Bounce, ToastContainer } from 'react-toastify';

import { logout } from "../redux/slices/authSlice";
import SearchPageIndex from '../pages/searchPages/SearchPageIndex';
import MorePageIndex from '../pages/morePages/MorePageIndex';
import HomePageIndex from '../pages/homePages/HomePageIndex';
import NoticationPageIndex from '../pages/notificationPages/NoticationPageIndex';
import PostPageIndex from '../pages/postPages/PostPageIndex';
import { checkToken } from '../redux/thunks/authThunk';
import { getUserProfile } from '../redux/thunks/userThunk';
import PostDetailPage from '../pages/postPages/PostDetailPage';
import PostDetailModal from '../pages/postPages/PostDetailModal';

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

// Chức năng Layout cho modal
function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    // backgroundLocation được truyền qua state khi sử dụng navigate() từ các component khác
    const background = location.state?.backgroundLocation;
    
    return (
        <>
            <Outlet />
            
            {/* Render modal khi có background location */}
            {background && (
                <Routes>
                    <Route 
                        path="/post/:postId" 
                        element={
                            <PostDetailModal 
                                onClose={() => navigate(-1)} 
                                openCommentBox={location.state?.openCommentBox}
                                isVisible={true}
                            />
                        } 
                    />
                </Routes>
            )}
        </>
    );
}

const MainView = () => {
    const { token } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Đảm bảo lấy đúng backgroundLocation từ state
    // Quan trọng: Lưu giữ backgroundLocation ban đầu trong suốt vòng đời component
    const background = useMemo(() => {
        return location.state?.backgroundLocation;
    }, [location.state?.backgroundLocation?.pathname]);
    
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
              Quan trọng: Sử dụng location từ background (nếu có) hoặc location hiện tại 
              Điều này đảm bảo không bị load lại nội dung đằng sau khi tương tác với modal
            */}
            <Routes location={background || location}>
                {/* Bọc tất cả các route trong AppLayout để hỗ trợ modal */}
                <Route element={<AppLayout />}>
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
                </Route>
            </Routes>

            {/* 
              Chỉ render modal khi có background location
              Modal này sẽ hiển thị ở trên cùng, không làm trang hiện tại bị reload
            */}
            {background && (
                <Routes>
                    <Route 
                        path="/post/:postId" 
                        element={
                            <PostDetailModal 
                                onClose={() => navigate(background.pathname || -1, { replace: true })} 
                                openCommentBox={location.state?.openCommentBox}
                                isVisible={true}
                            />
                        } 
                    />
                </Routes>
            )}
        </>
    );
};

export default MainView;