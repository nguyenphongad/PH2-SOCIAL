import React, { useEffect, useRef } from 'react';
import { IoSend } from "react-icons/io5";
import { IoImages } from "react-icons/io5";

const BoxMessageIndex = ({ messagesData, selectedPartner, userCheck }) => {


    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesData]);


    return (
        <div className='box_message_index'>
            {/* <div>{messagesData?.message || "KHÔNG CÓ TIN NHẮN NÀO"}</div> */}
            <div className='header_top_user_rev'>
                <div className='line_info_partner_header'>
                    <div>
                        <img src={selectedPartner.profilePicture} className="img_partner_header" />
                    </div>
                    <div>
                        <div id="name_rev">{selectedPartner.name}</div>
                        <div id="username_rev">@{selectedPartner.username}</div>
                    </div>
                </div>
                <div>
                    call
                </div>
            </div>


            <div className='box_messages_container'>
                {Array.isArray(messagesData?.messages) ? (
                    messagesData.messages.map((msg, idx) => {
                        const isMe = msg.senderId === userCheck.userID;

                        return (
                            <div className={isMe ? "message_pos_right" : "message_pos_left"}>
                                {isMe ? "" :
                                    <span>
                                        <img src={selectedPartner.profilePicture} className='image_avt_rev' />
                                    </span>}
                                <div className={isMe ? "border_right" : "border_left"}>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p>No messages found</p>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className='line_input_send'>
                <div className='line_pos'>
                    
                <textarea placeholder='Nhập tin nhắn'></textarea>
                <button className='btn_send'>
                    <IoSend />
                </button>
                </div>
                <div>
                    <IoImages />
                </div>
            </div>
        </div>
    );
}

export default BoxMessageIndex;
