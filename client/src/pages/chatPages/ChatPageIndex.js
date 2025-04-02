import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setChatData } from '../../redux/slices/chatSlice';
import { getListMessage } from '../../redux/thunks/chatThunk';

import { NavLink, useLocation } from "react-router-dom"


import { toast } from 'react-toastify';

const ChatPageIndex = () => {


    const get_conID = useLocation().pathname;
    const conID = get_conID.substring(6);

    // console.log(conID)


    // dispatch
    const dispatch = useDispatch();

    //state
    const [isloadingChat, setLoadingChat] = useState(true)

    // slice
    const { chatData } = useSelector((state) => state.chat);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoadingChat(true);
                await dispatch(getListMessage()).unwrap();

            } catch (error) {
                toast.error("Đã xảy ra lỗi khi tải danh sách chat. Vui lòng thử lại!");
                console.error(error);

            } finally {
                setLoadingChat(false);
            }
        };

        fetchMessages();
    }, [dispatch]);

    console.log(chatData)



    return (
        <div className='container_chat_page'>
            <div className='box_menu_chat'>
                Chat menu
                {isloadingChat ? (
                    <div>Loading chats...</div>


                ) : chatData?.partners?.length > 0 ? (
                    chatData.partners.map((partner) => (
                        <NavLink key={partner.userID} to={`/chat/${partner.formattedConversations.messages.conversationID}`}>
                            <div>{partner.username}</div>
                            {/* <div>{partner.}</div> */}
                        </NavLink>


                    ))
                ) : (
                    <div>Không có dữ liệu chat</div>
                )}
            </div>
            <div className='box_content_chat'>

                {

                }


                content chat, ấn chat ngay
            </div>
        </div>
    )
}

export default ChatPageIndex