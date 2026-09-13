import axios from "axios";

import { createContext, useState } from "react";

import {StatusCodes} from 'http-status-codes';
import { useNavigate } from "react-router-dom";
export const AuthContext=createContext({});
const client=axios.create({
    baseURL:"https://meetingroombackend.onrender.com/users"
});

export const AuthProvider=({ children })=>{

const[userData,setUserData]=useState(null);
const router=useNavigate();


const handleRegister=async(name,username,password)=>{
    try{
        const request=await client.post("/register",{
            name:name,
            username:username,
            password:password
        });

        if(request.status===StatusCodes.CREATED){
            return request.data.message;
        }
    } catch (error) {
        throw error;
    }
};

const handleLogin=async(username,password)=>{
    try{

    const request=await client.post("/login",{username,password});
    
    if(request.status===StatusCodes.OK){
       
        localStorage.setItem("token", request.data.token);
                router("/home");
            }}
    catch(error){
        throw error;
    }

};

const getHistoryOfUser=async()=>{

    try{
        let request=await client.get("/get_all_activity",{
         
            params:{
                token:localStorage.getItem("token")}
        });
        return request.data;
    }
    catch(e){
        throw e;
    }
}
const addToUserHistory=async(meetingcode)=>{
    try{
        let request=await client.post("/add_to_activity",{
            token:localStorage.getItem("token"),
            meetingCode:meetingcode
        });
        return request.data.status;
    }
    catch(e){
        throw e;
    }

}

const data={
    userData,
    handleRegister,handleLogin,getHistoryOfUser,addToUserHistory
}

return(
    <AuthContext.Provider value={data}>
        {children}
    </AuthContext.Provider>
)
};
