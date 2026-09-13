import dotenv from "dotenv";
dotenv.config();

import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
const port=8080;
import userRoutes from "./routes/user.routes.js";
import {connectToSocket} from "./controller/socketManager.js";
const url=process.env.MONGO_URL;
const app=express();

const server=createServer(app);
const io=connectToSocket(server);

app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));

app.use("/users",userRoutes);
app.set("port",(port));
server.listen(app.get("port"),async()=>{
    await mongoose.connect(url);
    console.log(`app is listening on port ${port}`);
});

