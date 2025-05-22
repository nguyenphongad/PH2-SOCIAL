import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PiCursorClickDuotone } from "react-icons/pi";
import { FaUserCircle, FaEnvelope, FaRegCalendarAlt, FaUserPlus } from "react-icons/fa";

import { getBoxMessage, getListMessage } from '../../redux/thunks/chatThunk';
import BoxMessageIndex from './BoxMessageIndex';
import LoadingText from '../../components/loadingComponent.js/LoadingText';

const ChatPageIndex = ({ userCheck }) => {
    const dispatch = useDispatch();
    const location = useLocation();

    // Redux state
    const { chatData, messagesData, status } = useSelector(state => state.chat);

    // Extract userId from URL
    const userID = location.pathname.startsWith("/chat/")
        ? location.pathname.split("/chat/")[1]
        : null;

    // Local state
    const [isLoadingChat, setIsLoadingChat] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [currentUserID, setCurrentUserID] = useState(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch danh sách cuộc trò chuyện
    useEffect(() => {
        const fetchChats = async () => {
            setIsLoadingChat(true);
            try {
                await dispatch(getListMessage()).unwrap();
            } catch (error) {
                console.error("Error details:", error);
                toast.error("Không thể tải danh sách chat. Vui lòng thử lại!");
            } finally {
                setIsLoadingChat(false);
            }
        };
        fetchChats();
    }, [dispatch]);

    // Fetch tin nhắn cho cuộc trò chuyện với userID đối phương
    useEffect(() => {
        if (!userID || userID === currentUserID || !chatData) return;

        // Tìm cuộc trò chuyện với đối phương dựa trên userID
        const conversation = chatData?.partners?.find(partner => partner.userID === userID);
        if (!conversation) {
            // Không cần báo lỗi nếu đây là cuộc trò chuyện mới
            console.log("Không tìm thấy cuộc trò chuyện hiện có, có thể đây là cuộc trò chuyện mới");
        }

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                await dispatch(getBoxMessage(userID)).unwrap();
                setCurrentUserID(userID);
            } catch (error) {
                console.error("Error fetching messages:", error);
                toast.error("Không thể tải tin nhắn. Vui lòng thử lại!");
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [dispatch, userID, currentUserID, chatData]);

    // Lọc danh sách đối tác theo tìm kiếm
    const filteredPartners = chatData?.partners?.filter(partner => 
        partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.username?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Lấy thông tin đối tác hiện tại
    const selectedPartner = chatData?.partners?.find(partner => partner.userID === userID);

    // Format last activity time
    const formatLastSeen = (timestamp) => {
        if (!timestamp) return "Không xác định";
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className='container_chat_page'>
            {/* Danh sách cuộc trò chuyện */}
            <div className='box_menu_chat'>
                <h3>Tin nhắn</h3>
                
                {/* Thanh tìm kiếm */}
                <div className="search-container" style={{padding: "10px 15px", borderBottom: "1px solid #f0f0f0"}}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 15px",
                            borderRadius: "20px",
                            border: "1px solid #ddd",
                            outline: "none",
                            fontSize: "14px"
                        }}
                    />
                </div>
                
                <div className='box_list_chats'>
                    {isLoadingChat ? (
                        <LoadingText text="Đang tải danh sách chat..." />
                    ) : filteredPartners.length > 0 ? (
                        filteredPartners.map(partner => (
                            <NavLink
                                key={partner.userID}
                                to={`/chat/${partner.userID}`}
                                className={({isActive}) => isActive ? "active_select_chat" : ""}
                            >
                                <div>
                                    <img 
                                        src={partner?.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                                        className='set_width_avt_partner'
                                        alt={partner?.name} 
                                    />
                                </div>
                                <div>
                                    <div className="user_name_st">{partner?.name || "Người dùng"}</div>
                                    <div className='last_mess_st'>
                                        {partner.formattedConversations?.messages?.lastMessage ? (
                                            <>
                                                {partner.formattedConversations.messages.lastMessage.isMeChat ? 
                                                    "Bạn: " : ""
                                                }
                                                {partner.formattedConversations.messages.lastMessage.content || ""}
                                            </>
                                        ) : "Bắt đầu cuộc trò chuyện"}
                                    </div>
                                </div>
                            </NavLink>
                        ))
                    ) : !isLoadingChat && searchTerm ? (
                        <div style={{padding: "15px", textAlign: "center", color: "#888"}}>
                            Không tìm thấy người dùng phù hợp
                        </div>
                    ) : !isLoadingChat && chatData?.partners?.length === 0 ? (
                        <div style={{padding: "15px", textAlign: "center", color: "#888"}}>
                            Chưa có cuộc trò chuyện nào
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Nội dung cuộc trò chuyện */}
            <div className='box_content_chat'>
                {userID ? (
                    isLoadingMessages ? (
                        <LoadingText text="Đang tải tin nhắn..." />
                    ) : messagesData ? (
                        <BoxMessageIndex
                            messagesData={messagesData}
                            selectedPartner={selectedPartner}
                            userCheck={userCheck}
                            onToggleInfo={() => setShowInfoPanel(!showInfoPanel)}
                        />
                    ) : (
                        <div style={{padding: "20px", textAlign: "center", color: "#888"}}>
                            Không thể tải tin nhắn. Vui lòng thử lại!
                        </div>
                    )
                ) : (
                    <div className="container_body_select_chats_partner">
                        <PiCursorClickDuotone />
                        <div className='text_sl_c_partner'>
                            Hãy chọn một cuộc trò chuyện!
                        </div>
                        <p>
                            Chọn một người dùng từ danh sách bên trái để bắt đầu trò chuyện
                        </p>
                    </div>
                )}
            </div>

            {/* Thông tin chi tiết người dùng */}
            <div className={`box_info_partner_source ${showInfoPanel ? "set_w_ac" : ""}`}>
                <div className='header_detail_source'>Thông tin</div>

                {selectedPartner && (
                    <div className="user_info_panel">
                        <img 
                            src={selectedPartner?.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                            alt={selectedPartner?.name} 
                            className="user_avatar"
                        />
                        <div className="user_name">{selectedPartner?.name || "Người dùng"}</div>
                        <div className="user_username">@{selectedPartner?.username || "user"}</div>
                        
                        <div style={{marginTop: "20px", width: "100%"}}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "15px",
                                color: "#666"
                            }}>
                                <FaUserCircle />
                                <span>Thông tin cá nhân</span>
                            </div>
                            
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "15px",
                                color: "#666"
                            }}>
                                <FaEnvelope />
                                <span>Gửi email</span>
                            </div>
                            
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "15px",
                                color: "#666"
                            }}>
                                <FaRegCalendarAlt />
                                <span>Hoạt động gần đây: {formatLastSeen(selectedPartner?.lastSeen)}</span>
                            </div>
                        </div>
                        
                        <div className="user_actions">
                            <button className="primary">
                                <FaUserPlus /> Theo dõi
                            </button>
                            <button>
                                Xem trang cá nhân
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPageIndex;
