import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { setChatData } from '../../redux/slices/chatSlice';
import { getBoxMessage, getListMessage } from '../../redux/thunks/chatThunk';

const ChatPageIndex = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    // Redux state
    const { chatData, messagesData } = useSelector(state => state.chat);

    // Extract userId from URL
    const userID = location.pathname.startsWith("/chat/")
        ? location.pathname.split("/chat/")[1]
        : null;

    // Local state
    const [isLoadingChat, setIsLoadingChat] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [currentUserID, setCurrentUserID] = useState(null);

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

    console.log(chatData)

    return (
        <div className='container_chat_page'>
            {/* Danh sách cuộc trò chuyện */}
            <div className='box_menu_chat'>
                <h3>Danh sách chat</h3>
                <div className='box_list_chats'>
                    {isLoadingChat ? (
                        <div>Đang tải danh sách chat...</div>
                    ) : chatData?.partners?.length > 0 ? (
                        chatData.partners.map(partner => (
                            <NavLink
                                key={partner.userID}
                                to={`/chat/${partner.userID}`}
                                style={partner.userID === userID ? { background: "red" } : {}}
                            >
                                <div>{partner.username}</div>
                                <div>{
                                    partner.formattedConversations.messages.lastMessage.isMeChat ?
                                        "Bạn: " + partner.formattedConversations.messages.lastMessage.content :
                                        partner.formattedConversations.messages.lastMessage.conten

                                }</div>
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
                        <div>
                            <div>{messagesData.message}</div>
                            <div>{messagesData.messages.map((index) => (
                                <div key={index}>
                                    {index.conversationId}
                                </div>
                            ))}</div>
                        </div>
                    ) : (
                        <div>Không có tin nhắn nào</div>
                    )
                ) : (
                    <div>Hãy chọn một cuộc trò chuyện!</div>
                )}
            </div>
        </div>
    );
};

export default ChatPageIndex;
