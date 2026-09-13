import React,{useState} from "react";
import withAuth from "../utils/WithAuth";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { useContext } from "react";
import { AuthContext } from "../contexts/Authcontext";

 function HomeComponent(){
    let navigate=useNavigate();
    const [meetingCode,setMeetingCode]=useState("");
    const {addToUserHistory}=useContext(AuthContext);
    let handleJoinVideoCall=async()=>{
        await addToUserHistory(meetingCode);
        navigate(`/meet/${meetingCode}`);

    }
    return(
        <>
        <div className="navBar">
            <div style={{display:"flex",alignItems:"center"}}>
                <h2>MeetingRoom</h2>
            </div>
            <div style={{display:"flex",alignItems:"center", color:"white"}}>
                <IconButton onClick={()=>{navigate("/history")}}>
                    <RestoreIcon/>
                    <p>History</p>
                </IconButton>
                
                <Button onClick={()=>{localStorage.removeItem("token");
                    navigate("/auth");
                }}>logout</Button>

            </div>
            </div>
            
             <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Someone expanding on you</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='https://th.bing.com/th/id/OIP.FHR9odiBsFj1ip4Ik-V98AHaE8?w=285&h=190&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' alt="" />
                </div>
                </div>
            </>
    );
}  

export default withAuth(HomeComponent)

