import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { Send } from "lucide-react";
import { userAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            console.log("Fetched Users:", res.data);
            set({ users: res.data });
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.log("error in get messages", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },


    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

            set({ messages: [...messages, res.data] });

        } catch (error) {
            console.log("Error sending message:", error);
            toast.error(error.response?.data?.message || "Failed to send message.");
        }
    },





    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = userAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            const isMessageSendFromSelectedUser = newMessage.senderId === selectedUser._id; 
            if (!isMessageSendFromSelectedUser) return;
            set({ messages: [...get().messages, newMessage] })
        });
    },

    unsubscribeFromMessages: () => {
        const socket = userAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));