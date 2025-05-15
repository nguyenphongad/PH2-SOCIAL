import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/thunks/authThunk';
import { toast } from 'react-toastify';
import LoadingButton from '../../components/loadingComponent.js/LoadingButton';
import AuthContainer from './AuthContainer';
import { FaUser, FaLock, FaSignInAlt, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {

    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
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
        } finally {
            setIsLoading(false);
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <AuthContainer>
                <>
                    <h2 className="form-title">Chào mừng trở lại!</h2>
                    <p className="form-subtitle">Đăng nhập vào tài khoản của bạn</p>
                    
                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="Tên đăng nhập"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            />
                        </div>
                        
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                            <div 
                                className="password-toggle-icon" 
                                onClick={togglePasswordVisibility}
                                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                        
                        <div className="forgot-link">
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn-login" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <LoadingButton size={30} />
                            ) : (
                                <>
                                    <FaSignInAlt className="btn-icon" style={{color: '#ffffff'}} />
                                    <span>ĐĂNG NHẬP</span>
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="divider">
                        <span>hoặc</span>
                    </div>
                    
                    <button className="btn-register" onClick={() => navigate('/register')}>
                        <FaUserPlus className="btn-icon" />
                        <span>ĐĂNG KÝ TÀI KHOẢN</span>
                    </button>
                </>
            </AuthContainer>
        </>
    )
}

export default LoginPage