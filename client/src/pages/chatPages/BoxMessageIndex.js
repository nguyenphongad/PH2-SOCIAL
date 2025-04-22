import React, { useEffect, useRef, useState } from 'react';
import { IoSend, IoImages } from "react-icons/io5";
import { FaInfoCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';

const BoxMessageIndex = ({ messagesData, selectedPartner, userCheck, onToggleInfo }) => {
    const [isFocused, setIsFocused] = useState(false);

    const messagesEndRef = useRef(null);
    const inputWrapperRef = useRef(null); // ref cho vùng line_input_send
    const textareaRef = useRef(null); // ref cho textarea để focus thủ công

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesData]);

    const handleFocusInpuText = () => {
        setIsFocused(true);
        setTimeout(() => {
            scrollToBottom();
        }, 200);
    };


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

    const handleClickWrapper = () => {
        textareaRef.current?.focus();
        setIsFocused(true);
        setTimeout(() => {
            scrollToBottom();
        }, 200);
    };


    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    };


    return (
        <div className='box_message_index'>
            <div className='header_top_user_rev'>
                <div className='line_info_partner_header'>
                    <div>
                        <img src={selectedPartner.profilePicture} className="img_partner_header" />
                    </div>
                    <div>
                        <div id="name_rev">{selectedPartner.name}</div>
                        <div id="username_rev">
                            <Link to={`/${selectedPartner.username}`}>
                                @{selectedPartner.username}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='box_parter_source'>
                    <FaInfoCircle onClick={onToggleInfo} />

                </div>
            </div>

            <div className='box_messages_container'>
                {Array.isArray(messagesData?.messages) ? (
                    messagesData.messages.map((msg, idx) => {
                        const isMe = msg.senderId === userCheck.userID;
                        return (
                            <div className={isMe ? "message_pos_right" : "message_pos_left"} key={idx}>
                                {isMe ? "" : (
                                    <span>
                                        <img src={selectedPartner.profilePicture} className='image_avt_rev' />
                                    </span>
                                )}
                                <div className={isMe ? "border_right" : "border_left"}>
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No messages found</p>
                )}
            </div>

            <div
                className='line_input_send'
                ref={inputWrapperRef}
                onClick={handleClickWrapper}
            >
                <div className='line_pos'>
                    <textarea
                        ref={textareaRef}
                        placeholder='Nhập tin nhắn'
                        onFocus={handleFocusInpuText}
                        onInput={autoResizeTextarea}
                    ></textarea>
                    <button className='btn_send'>
                        <IoSend />
                    </button>
                </div>

                <div className={`line_set_image ${isFocused ? "set_height_an" : ""}`}>
                    <label for="image">
                        <IoImages />
                    </label>
                    <input type="file" accept="image/*" id="image" style={{ display: "none" }} />
                </div>
            </div>

            <div ref={messagesEndRef} />
        </div>
    );
};

export default BoxMessageIndex;
