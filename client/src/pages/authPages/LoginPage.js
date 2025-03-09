import React, { useState } from 'react'
import { Link, Links, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/thunks/authThunk';

import { toast } from 'react-toastify';
import LoadingButton from '../../components/loadingComponent.js/LoadingButton';
import AuthContainer from './AuthContainer';

const LoginPage = () => {

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!credentials.username.trim() || !credentials.password.trim()) {
            toast.warning("Không để trống các trường!");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);

        try {
            const result = await dispatch(loginUser(credentials));

            // console.log("Kết quả từ API:", result);

            if (loginUser.fulfilled.match(result)) {
                const msg = result.payload?.message;
                toast.success(msg);
            } else {
                const msg = result.payload?.message || "Lỗi không xác định";
                toast.error(msg);
            }

        } catch (error) {
            const errorMessage = error?.response?.data?.message || "Đăng nhập không thành công!";
            toast.error(errorMessage);

            // console.error("Lỗi đăng nhập:", error);
        } finally {
            setIsLoading(false);
        }

    }


    return (
        <>
            <AuthContainer>
                <>
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={(e) => {
                                setCredentials({ ...credentials, username: e.target.value })
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder='Password'
                            value={credentials.password}
                            onChange={(e) => {
                                setCredentials({ ...credentials, password: e.target.value })
                            }}
                        />
                    </div>
                    <div>
                        <div>
                            <button onClick={handleLogin} disabled={isLoading}>
                                {isLoading ? <LoadingButton size={30} /> : "ĐĂNG NHẬP"}
                            </button>
                        </div>

                    </div>
                    <div>
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        ________________ hoặc ________________
                    </div>
                    <div>
                        <button className='btn_reg' onClick={() => navigate('/register')}>
                            ĐĂNG KÝ
                        </button>

                    </div>
                </>
            </AuthContainer>
        </>
    )
}

export default LoginPage