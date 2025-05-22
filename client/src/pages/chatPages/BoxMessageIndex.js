import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoSend, IoImages, IoDocumentText } from "react-icons/io5";
import { FaInfoCircle, FaSmile } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { sendMessage } from '../../redux/thunks/chatThunk';
import chatSocketService from '../../services/ChatSocketService';
import { toast } from 'react-toastify';

const BoxMessageIndex = ({ messagesData, selectedPartner, userCheck, onToggleInfo }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localMessages, setLocalMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [onlineStatus, setOnlineStatus] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputWrapperRef = useRef(null);
    const textareaRef = useRef(null);
    
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    // Thiết lập kết nối Socket.IO
    useEffect(() => {
        // Kết nối socket khi component mount
        chatSocketService.connect();
        
        // Kiểm tra trạng thái kết nối socket
        const checkSocketConnection = () => {
            const isConnected = chatSocketService.isConnected();
            if (isConnected !== socketConnected) {
                setSocketConnected(isConnected);
                if (isConnected) {
                    console.log("Socket đã được kết nối");
                } else {
                    console.log("Socket mất kết nối, đang thử kết nối lại");
                    chatSocketService.connect();
                }
            }
        };

        // Kiểm tra kết nối ban đầu
        checkSocketConnection();
        
        // Kiểm tra kết nối định kỳ
        const intervalId = setInterval(checkSocketConnection, 5000);

        return () => {
            clearInterval(intervalId);
            // Giữ kết nối socket khi unmount component để có thể nhận tin nhắn mới
        };
    }, [socketConnected]);

    // Đăng ký các callback xử lý sự kiện socket
    useEffect(() => {
        const handleConnect = () => {
            console.log("Socket kết nối thành công");
            setSocketConnected(true);
        };

        const handleDisconnect = (reason) => {
            console.log("Socket ngắt kết nối:", reason);
            setSocketConnected(false);
        };

        const handleReceiveMessage = (message) => {
            console.log("Nhận tin nhắn qua socket:", message);
            
            // Kiểm tra xem tin nhắn có liên quan đến cuộc trò chuyện hiện tại không
            if (selectedPartner && 
                ((message.senderId === selectedPartner.userID && message.receiverId === user.userID) ||
                 (message.receiverId === selectedPartner.userID && message.senderId === user.userID))
            ) {
                setLocalMessages(prev => {
                    // Kiểm tra xem tin nhắn đã tồn tại chưa
                    const messageExists = prev.some(m => m._id === message._id);
                    if (messageExists) {
                        return prev;
                    }
                    return [...prev, message];
                });
                
                // Phát âm thanh thông báo nếu là tin nhắn từ đối phương
                if (message.senderId === selectedPartner.userID) {
                    playMessageSound();
                }
                
                // Cuộn xuống dưới để hiển thị tin nhắn mới
                setTimeout(scrollToBottom, 100);
            }
        };

        const handlePartnerTyping = (data) => {
            if (selectedPartner && data.senderId === selectedPartner.userID) {
                setIsTyping(true);
                // Auto scroll khi thấy typing indicator
                setTimeout(scrollToBottom, 100);
            }
        };

        const handlePartnerStopTyping = (data) => {
            if (selectedPartner && data.senderId === selectedPartner.userID) {
                setIsTyping(false);
            }
        };

        const handleOnlineUsers = (onlineUsers) => {
            if (selectedPartner && selectedPartner.userID) {
                const isOnline = onlineUsers.includes(selectedPartner.userID);
                setOnlineStatus(isOnline);
            }
        };

        // Đăng ký các callbacks
        chatSocketService.registerCallbacks({
            onConnect: handleConnect,
            onDisconnect: handleDisconnect,
            onMessage: handleReceiveMessage,
            onTyping: handlePartnerTyping,
            onStopTyping: handlePartnerStopTyping,
            onOnlineUsers: handleOnlineUsers,
        });

        // Không cần cleanup callbacks vì socket được duy trì ở mức ứng dụng
    }, [selectedPartner, user]);

    // Cập nhật local messages khi messagesData thay đổi
    useEffect(() => {
        if (messagesData && messagesData.messages) {
            setLocalMessages(messagesData.messages);
            // Scroll xuống dưới sau khi tin nhắn được tải
            setTimeout(scrollToBottom, 100);
        }
    }, [messagesData]);

    // Scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        scrollToBottom();
    }, [localMessages.length, isTyping]);

    // Cuộn xuống cuối cuộc trò chuyện
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Phát âm thanh khi có tin nhắn mới
    const playMessageSound = () => {
        try {
            const audio = new Audio('/sounds/message.mp3');
            audio.volume = 0.5;
            audio.play().catch(error => console.error('Error playing sound:', error));
        } catch (error) {
            console.error("Error with audio playback:", error);
        }
    };

    // Xử lý focus vào ô nhập tin nhắn
    const handleFocusInpuText = () => {
        setIsFocused(true);
        setTimeout(scrollToBottom, 200);
    };

    // Xử lý click ngoài ô nhập tin nhắn
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (inputWrapperRef.current && !inputWrapperRef.current.contains(e.target)) {
                setIsFocused(false);
                
                // Gửi sự kiện dừng gõ khi click ra ngoài
                if (selectedPartner && user) {
                    chatSocketService.sendStopTyping(user.userID, selectedPartner.userID);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedPartner, user]);

    // Click vào wrapper để focus textarea
    const handleClickWrapper = () => {
        textareaRef.current?.focus();
        setIsFocused(true);
        setTimeout(scrollToBottom, 200);
    };

    // Auto resize textarea khi nhập text
    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 150);
            textarea.style.height = newHeight + 'px';
        }
    };
    
    // Xử lý khi người dùng nhập tin nhắn
    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        autoResizeTextarea();
        
        // Gửi sự kiện đang gõ
        if (selectedPartner && user) {
            // Kiểm tra trạng thái kết nối socket
            if (!socketConnected) {
                chatSocketService.connect();
            }
            
            // Clear timeout trước đó nếu có
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            
            // Gửi sự kiện đang gõ
            chatSocketService.sendTyping(user.userID, selectedPartner.userID);
            
            // Đặt timeout để gửi sự kiện dừng gõ sau 2 giây
            const timeout = setTimeout(() => {
                chatSocketService.sendStopTyping(user.userID, selectedPartner.userID);
            }, 2000);
            
            setTypingTimeout(timeout);
        }
    };
    
    // Xử lý khi người dùng gửi tin nhắn
    const handleSendMessage = async () => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isSubmitting || !selectedPartner) return;
        
        setIsSubmitting(true);
        
        try {
            console.log("Đang gửi tin nhắn...");
            
            // Gửi thông báo ngừng gõ
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            chatSocketService.sendStopTyping(user.userID, selectedPartner.userID);
            
            // Chuẩn bị dữ liệu tin nhắn
            const messageData = {
                senderId: user.userID,
                receiverId: selectedPartner.userID,
                message: trimmedMessage,
                conversationId: messagesData?.conversationId
            };
            
            // Thêm tin nhắn vào state local trước để hiển thị ngay (Optimistic UI)
            const optimisticMessage = {
                _id: `temp-${Date.now()}`,
                senderId: user.userID,
                receiverId: selectedPartner.userID,
                message: trimmedMessage,
                createdAt: new Date().toISOString(),
                pending: true
            };
            
            setLocalMessages(prev => [...prev, optimisticMessage]);
            setMessageText('');
            
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            
            // Scroll xuống để hiển thị tin nhắn mới
            setTimeout(scrollToBottom, 100);
            
            // Gửi tin nhắn qua socket
            chatSocketService.sendMessage(messageData);
            
            // Cũng gửi qua API để đảm bảo tin nhắn được lưu
            const response = await dispatch(sendMessage({
                receiverId: selectedPartner.userID,
                message: trimmedMessage
            })).unwrap();
            
            console.log("Gửi tin nhắn thành công:", response);
            
            // Cập nhật lại danh sách tin nhắn để thay thế tin nhắn tạm thời
            if (response) {
                setLocalMessages(prev => 
                    prev.map(msg => 
                        msg._id === optimisticMessage._id ? response : msg
                    )
                );
            }
            
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
            
            // Xóa tin nhắn tạm thời nếu gặp lỗi
            setLocalMessages(prev => 
                prev.filter(msg => msg._id !== `temp-${Date.now()}`)
            );
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Xử lý phím tắt (Enter để gửi, Shift+Enter để xuống dòng)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className='box_message_index'>
            <div className='header_top_user_rev'>
                <div className='line_info_partner_header'>
                    <div>
                        <img 
                            src={selectedPartner?.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                            alt={selectedPartner?.name} 
                            className="img_partner_header" 
                        />
                        {onlineStatus && (
                            <span className="online-indicator"></span>
                        )}
                    </div>
                    <div>
                        <div id="name_rev">{selectedPartner?.name || "Người dùng"}</div>
                        <div id="username_rev">
                            <Link to={`/${selectedPartner?.username}`}>
                                @{selectedPartner?.username || "user"}
                            </Link>
                            {onlineStatus ? (
                                <span className="online-status">Đang hoạt động</span>
                            ) : (
                                <span className="offline-status">Ngoại tuyến</span>
                            )}
                            {!socketConnected && (
                                <span className="connection-status">(Mất kết nối)</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className='box_parter_source'>
                    <FaInfoCircle onClick={onToggleInfo} title="Thông tin chi tiết" />
                </div>
            </div>

            <div className='box_messages_container' ref={messagesContainerRef}>
                {localMessages && localMessages.length > 0 ? (
                    localMessages.map((msg, idx) => {
                        const isMe = msg.senderId === userCheck?.userID;
                        return (
                            <div className={isMe ? "message_pos_right" : "message_pos_left"} key={idx}>
                                {!isMe && (
                                    <span>
                                        <img 
                                            src={selectedPartner?.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                                            className='image_avt_rev'
                                            alt={selectedPartner?.name} 
                                        />
                                    </span>
                                )}
                                <div className={`${isMe ? "border_right" : "border_left"} ${msg.pending ? 'pending-message' : ''}`}>
                                    {msg.message}
                                    <div className="message-time">
                                        {formatTime(msg.createdAt)}
                                        {isMe && msg.readStatus && (
                                            <span className="read-status">Đã đọc</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-messages">
                        <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                )}

                {/* Hiển thị "Đang gõ..." */}
                {isTyping && (
                    <div className="message_pos_left typing-indicator">
                        <span>
                            <img 
                                src={selectedPartner?.profilePicture || "https://res.cloudinary.com/dg1kyvurg/image/upload/v1747339399/posts/default-avatar.png"} 
                                className='image_avt_rev'
                                alt={selectedPartner?.name} 
                            />
                        </span>
                        <div className="typing-bubble">
                            <div className="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div
                className='line_input_send'
                ref={inputWrapperRef}
                onClick={handleClickWrapper}
            >
                {!socketConnected && (
                    <div className="socket-status-warning">
                        Đang kết nối lại... 
                        <button onClick={() => chatSocketService.refreshConnection()}>Thử lại</button>
                    </div>
                )}
                <div className='line_pos'>
                    <textarea
                        ref={textareaRef}
                        placeholder='Nhập tin nhắn...'
                        value={messageText}
                        onChange={handleInputChange}
                        onFocus={handleFocusInpuText}
                        onKeyDown={handleKeyPress}
                    ></textarea>
                    <button 
                        className='btn_send' 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || isSubmitting || !socketConnected}
                    >
                        <IoSend />
                    </button>
                </div>

                <div className={`line_set_image ${isFocused ? "set_height_an" : ""}`}>
                    <label htmlFor="image">
                        <IoImages /> Hình ảnh
                    </label>
                    <input type="file" accept="image/*" id="image" style={{ display: "none" }} />
                    
                    <label htmlFor="document">
                        <IoDocumentText /> Tài liệu
                    </label>
                    <input type="file" id="document" style={{ display: "none" }} />
                    
                    <label htmlFor="emoji">
                        <FaSmile /> Biểu tượng cảm xúc
                    </label>
                </div>
            </div>
        </div>
    );
};

export default BoxMessageIndex;
