import jwt from "jsonwebtoken";
import User from "../model/user.model.js";


export const protectRoutes = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(401).json({message: "Not authorized - No token"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userid).select("-password");

        if(!user){
            return res.status(401).json({message: "Not authorized - User not found"});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectRoutes", error);
        res.status(500).json({message: "Internal server error"});
    }
 }
    