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
    // const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await dispatch(loginUser(credentials));

            const msg = result.payload.message

            if (loginUser.fulfilled.match(result)) {
                toast.success(msg);
            } else {
                toast.error(msg);
            }

        } catch (error) {
            toast.error("Đăng nhập không thành công!");

        } finally {
            setIsLoading(false);
        }

    }


    const FormLogin = () => {
        return (
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
                    <button>
                        {
                            isLoading ?
                                <LoadingButton size={30} />
                                :
                                <span onClick={handleLogin}>ĐĂNG NHẬP</span>
                        }
                    </button>

                </div>
                <div>
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>
                <div style={{ textAlign: "center" }}>
                    ________________ hoặc ________________
                </div>
                <div>
                    <Link to="/register">
                        <button className='btn_reg'>
                            ĐĂNG KÝ
                        </button>
                    </Link>

                </div>
            </>
        )
    }

    return (
        <>
            <AuthContainer>
                <FormLogin />
            </AuthContainer>
        </>
    )
}

export default LoginPage