import express from "express"; 
import dotenv from "dotenv";
import cookeParser from "cookie-parser";
import cors from "cors";
import authRouts from "./routes/auth.routes.js"
import messageRouts from "./routes/message.routes.js"
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 5001
const __dirname = path.resolve();


app.use(express.json());
app.use(cookeParser());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));


app.use('/api/auth', authRouts)
app.use('/api/messages', messageRouts)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

server.listen(PORT, () => {
    console.log("Server is running on port ", PORT);
    connectDB()
});