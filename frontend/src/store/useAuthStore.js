import { create } from "zustand";
import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";
import { data } from "react-router-dom";
import { io } from "socket.io-client";
import { use } from "react";

const BASE_URL = import.meta.env.MODE === "development"? "http://localhost:5001" : "/";

export const userAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("error in checkAuth",error);
            set({ authUser: null });
        }
        finally {
            set({ isCheckingAuth: false });
        }
        
    },


    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            console.log( res);
            
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("error in signup",error);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            set({ authUser: res.data });
            toast.success('Login Successfully');
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("error while Login");
        } finally {
            set({isLoggingIn:false})
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logout successful");
            get().disconnectSocket();
        } catch (error) {
            console.log("error in logout", error);
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Error while updating profile:", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            set({ isUpdatingProfile: false }); 
        }
    },
    

    connectSocket: () => {
        const { authUser } = get()
        if(!authUser || get().socket?.connected) return
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id 
            }
        })
        socket.connect();

        set({ socket: socket });
        
        socket.on("getOnlineUsers",(userIds)=> {
            set({onlineUsers: userIds});
        })
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }
}));

