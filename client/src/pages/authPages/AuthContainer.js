import React from 'react'
import text_logo from "../../assets/logo/text_logo.png"

const AuthContainer = ({children}) => {
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
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AuthContainer