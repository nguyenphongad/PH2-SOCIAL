import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import text_logo from "../../assets/logo/text_logo.png"
import { loginUser } from '../../redux/thunks/authThunk';

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
        setIsLoading(true);

        try {

            const result = await dispatch(loginUser(credentials));
            if (loginUser.fulfilled.match(result)) {
                console.log("log oke")
            } else {
                console.log("login that bai")
            }

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }

    }




    return (
        <div className='container_page_auth'>
            <div className='layout_intro'>
                <div>
                    <img src={text_logo} alt="text logo" className='img_logo' />

                    <div className='text_intro'>
                        Public Hangout 2<br />
                        Trang mạng xã hội kết nối giữa mọi nơi.<br />
                        Nhắn tin, chia sẻ khoảnh khắc với mọi người.
                    </div>
                </div>
            </div>
            <div className='box_layout_form'>
                <div className='form_border'>
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={credentials.username}
                            onChange={(e)=>{
                                setCredentials({...credentials, username: e.target.value})
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder='Password'
                            value={credentials.password}
                            onChange={(e)=>{
                                setCredentials({...credentials, password: e.target.value})
                            }}
                        />
                    </div>
                    <div>
                        <button onClick={handleLogin}>
                            ĐĂNG NHẬP
                        </button>
                    </div>
                    <div>
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>
                    <div>
                        ___________________ hoặc ___________________
                    </div>
                    <div>
                        <button className='btn_reg'>
                            ĐĂNG KÝ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage