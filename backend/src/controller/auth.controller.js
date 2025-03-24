import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
    const { email, fullname, password } = req.body
    try {
        if(!email || !fullname || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length <6){
            return res.status(400).json({message: "password should be at least 6 characters long"});
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "Email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            fullname,
            password: hashedPassword
        });
        

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();
            return res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilePic
            });
        }else{
            return res.status(500).json({message: "Invalid user data"});
        }
        
    } catch (error) {
        console.log("Error in signup", error);
        res.status(500).json({message: "Internal server error"});
    }
}
export const login = async(req, res) => {
    const { email, password } = req.body
    try {

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"});
        }
        generateToken(user._id, res);
        return res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic
        });
        
    } catch (error) {
        console.log("Error in signup", error);
        res.status(500).json({message: "Internal server error"});
    }
}
export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logout successful" });
        
    } catch (error) {
        console.log("Error in logout", error);
        res.status(500).json({message: "Internal server error"});
    }

}


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        const userId = req.user._id;

        if(!profilePic){    
            return res.status(400).json({message: "Profile picture is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });
        
        res.status(200).json(updateUser);
    } catch (error) {
        console.log("Error in updateProfile", error);
        res.status(500).json({message: "Internal server error"});
    }
}
 


export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(500).json({message: "Internal server error"});
    }
}