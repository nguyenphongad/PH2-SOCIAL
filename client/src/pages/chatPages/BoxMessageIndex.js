import React from 'react';

const BoxMessageIndex = ({ messagesData, selectedPartner, userCheck }) => {
    return (
        <div className='box_message_index'>
            {/* <div>{messagesData?.message || "KHÔNG CÓ TIN NHẮN NÀO"}</div> */}
            <div className='header_top_user_rev'>
                <div id="username_rev">{selectedPartner.username}</div>
            </div>


            <div className='box_messages_container'>
                {Array.isArray(messagesData?.messages) ? (
                    messagesData.messages.map((msg, idx) => {
                        const isMe = msg.senderId === userCheck.userID;

                        return (
                            <div className={isMe ? "message_pos_right" : "message_pos_left"}>
                                {isMe ? "" : <div>
                                    <img src={selectedPartner.profilePicture} className='image_avt_rev' />
                                </div>}
                                <div className={isMe ? "border_right" : "border_left"}>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p>No messages found</p>
                )}
            </div>
            <div className='line_input_send'>
                <textarea placeholder='Nhập tin nhắn'></textarea>
                <button>Send</button>
            </div>
        </div>
    );
}

export default BoxMessageIndex;
