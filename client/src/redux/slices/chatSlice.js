import { createSlice } from "@reduxjs/toolkit";
import { getBoxMessage, getListMessage, sendMessage } from "../thunks/chatThunk";

const initialState = {
    chatData: null,
    messagesData: null,
    status: "idle",
    error: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setChatData: (state, action) => {
            state.chatData = action.payload;
        },
        clearChatData: (state) => {
            state.chatData = null;
            state.messagesData = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Xử lý getListMessage
            .addCase(getListMessage.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getListMessage.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.chatData = action.payload;
            })
            .addCase(getListMessage.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Xử lý getBoxMessage
            .addCase(getBoxMessage.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(getBoxMessage.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.messagesData = action.payload;
            })
            .addCase(getBoxMessage.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            
            // Xử lý sendMessage
            .addCase(sendMessage.pending, (state) => {
                state.status = "sending";
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.status = "succeeded";
                
                // Thêm tin nhắn mới vào cuộc trò chuyện hiện tại
                if (state.messagesData && action.payload) {
                    // Đảm bảo có mảng messages
                    if (!state.messagesData.messages) {
                        state.messagesData.messages = [];
                    }
                    
                    // Thêm tin nhắn mới
                    state.messagesData.messages.push(action.payload);
                    
                    // Cập nhật thông tin lastMessage trong chatData
                    if (state.chatData && state.chatData.partners && action.payload.receiverId) {
                        const partnerIndex = state.chatData.partners.findIndex(
                            p => p.userID === action.payload.receiverId
                        );
                        
                        if (partnerIndex !== -1) {
                            if (!state.chatData.partners[partnerIndex].formattedConversations) {
                                state.chatData.partners[partnerIndex].formattedConversations = { messages: {} };
                            }
                            
                            if (!state.chatData.partners[partnerIndex].formattedConversations.messages) {
                                state.chatData.partners[partnerIndex].formattedConversations.messages = {};
                            }
                            
                            state.chatData.partners[partnerIndex].formattedConversations.messages.lastMessage = {
                                content: action.payload.message,
                                time: action.payload.createdAt,
                                isMeChat: true
                            };
                        }
                    }
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    }
});

export const { setChatData, clearChatData } = chatSlice.actions;
export default chatSlice.reducer;