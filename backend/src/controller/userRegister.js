import {User} from "../model/userSchema.js";
import httpStatus from "http-status";
import bcrypt,{hash} from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../model/meetingSchema.js";
const login=async(req,res)=>{
const {username,password}=req.body;
if(!username || !password){
    return res.status(400).json({message:"please provide valid username and password"});
}
try{
    const user=await User.findOne({username});
    if(!user){
        return res.status(httpStatus.NOT_FOUND).json({message:"User not found"});
    }
    let isPasswordCorrect=await bcrypt.compare(password,user.password);
if(isPasswordCorrect){
    let token=crypto.randomBytes(20).toString("hex");
    user.token=token;
    await user.save();
    return res.status(httpStatus.OK).json({token:token});
}
else{
    return res.status(httpStatus.UNAUTHORIZED).json({message:"invalid username or password"});
}
      }  
catch(e){
    res.status(500).json({message:'something wrong'});
}

    }



const register=async(req,res)=>{
    const {name,username,password}=req.body;
    try{
        const existing=await User.findOne({username});
        if(existing){
          return  res.status(httpStatus.FOUND).json({message:"user with this username already exists"});

        }
        const hasPas=await bcrypt.hash(password,10);
        const newUser=new User({
            name:name,
            username:username,
            password:hasPas
        });
        newUser.save();
        res.status(httpStatus.CREATED).json({message:"user registered"});

    }
    catch(e) {
        res.json({message:`something went wrong ${e}`});
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "User not found" });
        }

        const meetings = await Meeting.find({ user_id: user.username }).sort({ date: -1 });
        return res.json(meetings);
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "something went wrong" });
    }
};

const addToHistory = async (req, res) => {
    const { token, meetingCode } = req.body;

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "User not found" });
        }

        const newMeetings = new Meeting({
            user_id: user.username,
            meetingCode: meetingCode,
            date: new Date()
        });

        await newMeetings.save();
        return res.status(httpStatus.CREATED).json({ message: 'added to history' });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "something went wrong" });
    }
};
export {login,register,getUserHistory,addToHistory};
