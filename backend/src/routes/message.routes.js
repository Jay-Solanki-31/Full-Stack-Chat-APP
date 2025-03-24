import express from "express";
import { protectRoutes } from "../middleware/auth.middleware.js";
import { getUserForSidebar , getMessages , sendMessage} from "../controller/message.controller.js";
const router = express.Router();


router.get("/users", protectRoutes,getUserForSidebar)
router.get("/:id", protectRoutes, getMessages)

router.post("/send/:id", protectRoutes,sendMessage )
export default router