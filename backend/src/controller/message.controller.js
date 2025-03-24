import Message from "../model/message.model.js";
import User from "../model/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReciverSocketId, io } from "../lib/socket.js";
export const getUserForSidebar = async(req, res) => { 
    try {
        const loggedInUserId = req.user._id;
        // console.log(loggedInUserId);
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId }}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUserForSidebar", error);
        res.status(500).json({message: "Internal server error"});
    }
}


export const getMessages = async (req, res) => {
    try {
        const { id: userChatID } = req.params;
        const myID = req.user._id;

        const message = await Message.find({
            $or: [
                { senderId: myID, receiverId: userChatID },
                { senderId: userChatID, receiverId: myID }
            ]
        })
        res.status(200).json(message);
    } catch (error) {
        console.log("Error in getMessages", error);
        res.status(500).json({message: "Internal server error"});
    }
}




export const sendMessage = async (req, res) => { 
    try {
        const { text, image } = req.body;
        console.log(req.body);
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = "";
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        // todo : realtime functionally goes hera => socket.io
        const reciverSocketId = getReciverSocketId(receiverId);
        if (reciverSocketId) {
            io.to(reciverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage", error);
        res.status(500).json({message: "Internal server error"});
    }
}