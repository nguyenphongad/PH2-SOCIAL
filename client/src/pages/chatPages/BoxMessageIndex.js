import React, { useEffect, useRef, useState } from 'react';
import { IoSend, IoImages, IoDocumentText, IoVideocam } from "react-icons/io5";
import { FaInfoCircle, FaSmile } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { sendMessage } from '../../redux/thunks/chatThunk';

const BoxMessageIndex = ({ messagesData, selectedPartner, userCheck, onToggleInfo }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputWrapperRef = useRef(null);
    const textareaRef = useRef(null);
    
    const dispatch = useDispatch();

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesData]);

    // Handle textarea focus
    const handleFocusInpuText = () => {
        setIsFocused(true);
        setTimeout(() => {
            scrollToBottom();
        }, 200);
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputWrapperRef.current &&
                !inputWrapperRef.current.contains(event.target)
            ) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Click on input wrapper to focus textarea
    const handleClickWrapper = () => {
        textareaRef.current?.focus();
        setIsFocused(true);
        setTimeout(() => {
            scrollToBottom();
        }, 200);
    };

    // Auto resize textarea as user types
    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const newHeight = Math.min(textarea.scrollHeight, 150);
            textarea.style.height = newHeight + "px";
        }
    };
    
    // Handle sending a message
    const handleSendMessage = async () => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage || isSubmitting || !selectedPartner) return;
        
        setIsSubmitting(true);
        
        try {
            await dispatch(sendMessage({
                receiverId: selectedPartner.userID,
                message: trimmedMessage
            })).unwrap();
            
            // Clear message input
            setMessageText('');
            
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
            
            // Scroll to bottom
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handle key press (Ctrl+Enter or Enter to send)
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
                    </div>
                    <div>
                        <div id="name_rev">{selectedPartner?.name || "Người dùng"}</div>
                        <div id="username_rev">
                            <Link to={`/${selectedPartner?.username}`}>
                                @{selectedPartner?.username || "user"}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='box_parter_source'>
                    <FaInfoCircle onClick={onToggleInfo} title="Thông tin chi tiết" />
                </div>
            </div>

            <div className='box_messages_container' ref={messagesContainerRef}>
                {Array.isArray(messagesData?.messages) && messagesData.messages.length > 0 ? (
                    messagesData.messages.map((msg, idx) => {
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
                                <div className={isMe ? "border_right" : "border_left"}>
                                    {msg.message}
                                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                                        {formatTime(msg.createdAt)}
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
                <div ref={messagesEndRef} />
            </div>

            <div
                className='line_input_send'
                ref={inputWrapperRef}
                onClick={handleClickWrapper}
            >
                <div className='line_pos'>
                    <textarea
                        ref={textareaRef}
                        placeholder='Nhập tin nhắn...'
                        value={messageText}
                        onChange={(e) => {
                            setMessageText(e.target.value);
                            autoResizeTextarea();
                        }}
                        onFocus={handleFocusInpuText}
                        onInput={autoResizeTextarea}
                        onKeyDown={handleKeyPress}
                    ></textarea>
                    <button 
                        className='btn_send' 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || isSubmitting}
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
