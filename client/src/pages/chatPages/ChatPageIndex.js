import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { setChatData } from '../../redux/slices/chatSlice';
import { getBoxMessage, getListMessage } from '../../redux/thunks/chatThunk';
import BoxMessageIndex from './BoxMessageIndex';

import { PiCursorClickDuotone } from "react-icons/pi";

const ChatPageIndex = ({ userCheck }) => {
    const dispatch = useDispatch();
    const location = useLocation();

    // Redux state
    const { chatData, messagesData } = useSelector(state => state.chat);

    // console.log(userCheck)

    // Extract userId from URL
    const userID = location.pathname.startsWith("/chat/")
        ? location.pathname.split("/chat/")[1]
        : null;

    // Local state
    const [isLoadingChat, setIsLoadingChat] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);

    // Fetch danh sách cuộc trò chuyện
    useEffect(() => {
        const fetchChats = async () => {
            setIsLoadingChat(true);
            try {
                await dispatch(getListMessage()).unwrap();
            } catch (error) {
                toast.error("Đã xảy ra lỗi khi tải danh sách chat. Vui lòng thử lại!");
            } finally {
                setIsLoadingChat(false);
            }
        };
        fetchChats();
    }, [dispatch]);

    // Fetch tin nhắn cho cuộc trò chuyện với userID đối phương
    useEffect(() => {
        if (!userID || userID === currentUserID || !chatData) return; // Chờ chatData có giá trị

        // Tìm cuộc trò chuyện với đối phương dựa trên userID
        const conversation = chatData?.partners.find(partner => partner.userID === userID);
        if (!conversation) {
            toast.error("Không tìm thấy cuộc trò chuyện với đối phương này.");
            return;
        }

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                await dispatch(getBoxMessage(userID)).unwrap(); // Truy vấn tin nhắn với đối phương
                setCurrentUserID(userID);  // Lưu userID của đối phương vào state
            } catch (error) {
                toast.error("Không thể tải tin nhắn. Vui lòng thử lại!");
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [dispatch, userID, currentUserID, chatData]);

    // console.log(chatData)

    const selectedPartner = chatData?.partners.find(partner => partner.userID === userID);

    return (
        <div className='container_chat_page'>
            {/* Danh sách cuộc trò chuyện */}
            <div className='box_menu_chat'>
                <h3>Tin nhắn</h3>
                <div className='box_list_chats'>
                    {isLoadingChat ? (
                        <div>Đang tải danh sách chat...</div>
                    ) : chatData?.partners?.length > 0 ? (
                        chatData.partners.map(partner => (
                            <NavLink
                                key={partner.userID}
                                to={`/chat/${partner.userID}`}
                                className={partner.userID === userID ? "active_select_chat" : {}}
                            >
                                <div>
                                    <img src={partner?.profilePicture} className='set_width_avt_partner' />
                                </div>
                                <div>
                                    <div className="user_name_st">{partner?.name}</div>
                                    <div className='last_mess_st'>{
                                        partner.formattedConversations.messages?.lastMessage?.isMeChat ?
                                            "Bạn: " + partner.formattedConversations.messages?.lastMessage.content :
                                            partner.formattedConversations.messages?.lastMessage?.content

                                    }</div>
                                </div>
                            </NavLink>
                        ))
                    ) : (
                        <div>Không có cuộc trò chuyện nào</div>
                    )}
                </div>
            </div>

            {/* Nội dung cuộc trò chuyện */}
            <div className='box_content_chat'>
                {userID ? (
                    isLoadingMessages ? (
                        <div>Đang tải tin nhắn...</div>
                    ) : messagesData ? (
                        <>

                            <BoxMessageIndex
                                messagesData={messagesData}
                                selectedPartner={selectedPartner}
                                userCheck={userCheck}
                                onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
                            />

                        </>
                    ) : (
                        <div>Không có tin nhắn nào</div>
                    )
                ) : (
                    <div className="container_body_select_chats_partner">
                        <div>
                            <PiCursorClickDuotone />
                        </div>
                        <div className='text_sl_c_partner'>
                            Hãy chọn một cuộc trò chuyện!
                        </div>
                    </div>
                )}
            </div>


            <div className={`box_info_partner_source ${showInfoPanel ? "set_w_ac" : "set_width_unac"}`}>
                <div className='header_detail_source'>Chi tiết</div>

                <div>

                </div>
            </div>


        </div>
    );
};

export default ChatPageIndex;
