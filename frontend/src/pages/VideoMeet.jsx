import React from "react";
import { useRef, useState,useEffect } from "react";
import "../styles/videomeet.css";
import { Badge, Button, IconButton, TextField } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";

import ChatIcon from "@mui/icons-material/Chat";

import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
    const server_url="http://localhost:8080";

    const connections={

    };

    const peerConfigConnections={
        'iceServers':[
            {  "urls":"stun:stun.l.google.com:19302"  },]
        }

export default function VideoMeetComponent() {
let socketRef=useRef();
let socketIdRef=useRef();
let localVideoRef=useRef();

let [videoAvailable,setVideoAvailable]=useState(true);

let [audioAvailable,setAudioAvailable]=useState(true);

let[video,setVideo]=useState([]);
let [audio,setAudio]=useState();
let [screen,setScreen]=useState();
let [showModal,setModal]=useState(false);
let [screenAvailable,setScreenAvailable]=useState();
let [messages,setMessages]=useState([]);
let [message,setMessage]=useState();
    let [newMessage,setNewMessage]=useState(0);
    let [askForUsername,setAskForUsername]=useState(true);
    let [username,setUsername]=useState("");
    const videoRef = useRef([]);
    let [videos,setVideos]=useState([]);

    const getPermissions=async()=>{
        try{
            const videoPermission=await navigator.mediaDevices.getUserMedia({video:true});

            if(videoPermission){
                setVideoAvailable(true);
            }
            else{
                setVideoAvailable(false);
            }

        const audioPermission=await navigator.mediaDevices.getUserMedia({audio:true});
        if(audioPermission){
            setAudioAvailable(true);
        }
        else{
            setAudioAvailable(false);
        }

        if(navigator.mediaDevices.getDisplayMedia){
            setScreenAvailable(true);
        }
        else{
            setScreenAvailable(false);
        }
        if(videoAvailable && audioAvailable){
            const userMediaStream=await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});
            if(userMediaStream){
                window.localStream=userMediaStream;
                if(localVideoRef.current){
                    localVideoRef.current.srcObject=userMediaStream;
                }
            }
        }

        } catch (err) {
            console.error("Error accessing media devices:", err);
        }

    };
    useEffect(()=>{
        getPermissions();
    },[]);



let getuserMediaSuccess=(stream)=>{
try{
    window.localStream.getTracks().forEach((track)=>{
        track.stop();
    });
}
catch(err){console.log(err)}

window.localStream=stream;
localVideoRef.current.srcObject=stream;
for(let id in connections){
    if(id===socketIdRef.current){
        continue;
    }

updatePeerStream(connections[id], window.localStream);

connections[id].createOffer().then((description)=>{
    connections[id].setLocalDescription(description).then(()=>{
        socketRef.current.emit('signal',id,JSON.stringify({'sdp':connections[id].localDescription}));
    }).catch((err)=>{console.log("Error setting local description:", err);})
}).catch((err)=>{console.log("Error creating offer:", err);})

}

stream.getTracks().forEach(track=>track.onended=()=>{
    setVideoAvailable(false);
    setAudioAvailable(false);
    try{
        let tracks=localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track)=>{track.stop();});
    }
    catch(err){ console.log(err); }

    //todo blacksilence
 let blackSilence=(...args)=>new MediaStream([black(...args),silence()]);
        window.localStream=blackSilence();
    localVideoRef.current.srcObject=window.localStream;        

    for(let id in connections){
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description)=>{
            connections[id].setLocalDescription(description).then(()=>{
                socketRef.current.emit('signal',id,JSON.stringify({'sdp':connections[id].localDescription}));
            }).catch((err)=>{console.log("Error setting local description:", err);})
        })
    }
})

    }

    let silence=()=>{
    
        let ctx=new AudioContext();
        let oscillator=ctx.createOscillator();
        let dst=oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false});

    }

    let black=({width=640,height=480}={})=>{
        let canvas=Object.assign(document.createElement("canvas"),{width,height});
        canvas.getContext("2d").fillRect(0,0,width,height);
        let stream=canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0],{enabled:false});



    }

    let getUserMedia=async()=>{ 
        if((video && videoAvailable) ||(audio && audioAvailable)){
          
            try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio
      });

      
      getuserMediaSuccess(stream);

    } catch (err) {
      console.error("Error accessing media:", err);
    }
        }
        else {

            try{


            let tracks=localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track)=>{
                track.stop();
            });
        }
            catch(err){
                
            }

        }
    };

    useEffect(()=>{
        if(videoAvailable!==undefined && audioAvailable!==undefined){
            getUserMedia();
        }
    },[audio,video]);


    const updatePeerStream = (peerConnection, stream) => {
        stream.getTracks().forEach((track) => {
            const sender = peerConnection.getSenders().find((item) => item.track && item.track.kind === track.kind);
            if (sender) {
                sender.replaceTrack(track);
            } else {
                peerConnection.addTrack(track, stream);
            }
        });
    };

    const addRemoteVideo = (socketListId, stream) => {
        setVideos((currentVideos) => {
            const existingVideo = currentVideos.find((video) => video.socketId === socketListId);
            const updatedVideos = existingVideo
                ? currentVideos.map((video) => video.socketId === socketListId ? { ...video, stream } : video)
                : [...currentVideos, { socketId: socketListId, stream }];
            videoRef.current = updatedVideos;
            return updatedVideos;
        });
    };

    const createPeerConnection = (socketListId) => {
        if (connections[socketListId]) {
            return connections[socketListId];
        }

        const peerConnection = new RTCPeerConnection(peerConfigConnections);
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('signal', socketListId, JSON.stringify({ ice: event.candidate }));
            }
        };
        peerConnection.ontrack = (event) => {
            if (event.streams[0]) {
                addRemoteVideo(socketListId, event.streams[0]);
            }
        };
        connections[socketListId] = peerConnection;
        return peerConnection;
    };

    let gotMessageFromServer=(fromId,message)=>{

        var signal=JSON.parse(message);
        if(fromId!==socketIdRef.current){
            const peerConnection = createPeerConnection(fromId);
            if(signal.sdp){
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                    if(signal.sdp.type==='offer'){
                        peerConnection.createAnswer().then((description)=>{
                            peerConnection.setLocalDescription(description).then(()=>{
                                socketRef.current.emit('signal',fromId,JSON.stringify({'sdp':peerConnection.localDescription}));
                            }).catch((err)=>{
                                console.log("Error setting local description:", err);
                            })
                        }).catch((err)=>{ console.log("Error creating answer:", err);})
                    }   
                }).catch((err)=>{ console.log("Error setting remote description:", err); })
            }
    if(signal.ice){
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch((err)=>{console.log("Error adding ICE candidate:", err);});
    }
    
    }
}
const addMessage=(data,sender,socketIdSender)=>{
    setMessages((prevMessages)=>
       [ ...prevMessages,{
        sender:sender,data:data
       }]
    );
    if(socketIdSender!==socketIdRef.current){

        setNewMessage((prevMessages)=>prevMessages+1);
    }
}

let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => {
                    const updatedVideos = videos.filter((video) => video.socketId !== id);
                    videoRef.current = updatedVideos;

                    if (updatedVideos.length === 0) {
                        handleEndCall();
                    }

                    return updatedVideos;
                })
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    const peerConnection = createPeerConnection(socketListId);


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        updatePeerStream(peerConnection, window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        updatePeerStream(peerConnection, window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            updatePeerStream(connections[id2], window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }



    let getMedia=()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
       connectToSocketServer();
    };

    let connect=()=>{
        setAskForUsername(false);
        getMedia();
    }

    let handleVideo=()=>{
        setVideo(!video);
    }
let handleAudio=()=>{
    setAudio(!audio);
}
let handleScreen=()=>{
    setScreen(!screen);
}

 let getDislayMediaSuccess = (stream) => {

    try{
        window.localStream.getTracks().forEach(track=>track.stop());

    }
    catch(e){
        console.log(e);


    }
    window.localStream=stream;
    localVideoRef.current.srcObject=stream;

    for(let id in connections){
        if(id===socketIdRef.current){continue}
        updatePeerStream(connections[id], window.localStream);

connections[id].createOffer().then((description)=>{
    connections[id].setLocalDescription(description).then(()=>{
        socketRef.current.emit('signal',id,JSON.stringify({'sdp':connections[id].localDescription}));
    }).catch((err)=>{console.log("Error setting local description:", err);})
}).catch((err)=>{console.log("Error creating offer:", err);})

    }

    stream.getTracks().forEach(track=>track.onended=()=>{
        setScreen(false);
    try{
        let tracks=localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track)=>{track.stop();});
    }
    catch(err){ console.log(err); }

    //todo blacksilence
 let blackSilence=(...args)=>new MediaStream([black(...args),silence()]);
        window.localStream=blackSilence();
    localVideoRef.current.srcObject=window.localStream;        

    getUserMedia();
})

    }


let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }


useEffect(()=>{ 
    if(screen!==undefined){
        getDislayMedia();
    }
},[screen]);

let sendMessage=()=>{
    socketRef.current.emit("chat-message",message,username);
    setMessage("");
}

let routeTo=useNavigate();
let handleEndCall=()=>{
    try{
        let tracks=localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track)=>{track.stop()})
    }
    catch(e){
        console.log(e);

    }

    Object.values(connections).forEach((connection) => connection.close());
    Object.keys(connections).forEach((id) => delete connections[id]);

    if (socketRef.current) {
        socketRef.current.disconnect();
    }

    routeTo('/home');
    
}


  return (
    <div>
        {
            askForUsername===true?
            <div>
            <h2>Enter into Lobby</h2>
            <TextField id="outlined-basic" label="Username" variant="outlined" onChange={(e)=>{setUsername(e.target.value)}}/>
            <Button variant="contained" onClick={connect}>Connect</Button>

            <div>
                <video ref={localVideoRef} autoPlay muted ></video>
            </div>

            </div>: <div className="meetVideoContainer">
            <video className="meetUserVideo" ref={localVideoRef} autoPlay muted></video>
            
            {showModal?<div className="chatRoom">
               <div className="chatContainer">
                <h1>Chat</h1>
                 <div className="chattingDisplay">

                {messages.length>0 && messages.map((item,index)=>{
                    return(
                        <div key={index} style={{marginBottom:"20px"}}>
                    <p style={{fontWeight:"bold", }}>{item.sender}</p>
                    <p>{item.data}</p>
                        </div>
                    )
                })}

                </div>

                <div className="chattingArea">
               
               <TextField value={message} onChange={(e)=>{setMessage(e.target.value)}}id="standard-basic" label="Enter your chat" variant="standard" />
                <Button onClick={sendMessage} variant="contained">Send</Button>
                </div>
                </div>
            </div>:<></>}

           <div className="buttonContainers">

            <IconButton onClick={handleVideo} style={{color:"white"}}>
                {(video===true)?<VideocamIcon/>:<VideocamOffIcon/>}
            </IconButton>

           <IconButton onClick={handleAudio} style={{color:"white"}}>
                {(audio===true)?<MicIcon/>:<MicOffIcon/>}

            </IconButton>

            {(screenAvailable===true)?
            <IconButton onClick={handleScreen} style={{color:"white"}}>
                {(screen===true)?<ScreenShareIcon/>:<StopScreenShareIcon/>}

            </IconButton>:<></>
            }

            <Badge badgeContent={newMessage} max={999} color="secondary" >
            <IconButton onClick={()=>{setModal(!showModal)}} style={{color:"white"}}>

            <ChatIcon/>
            </IconButton>


            </Badge>

           
            <IconButton onClick={handleEndCall} style={{color:"red"}}>
                    <CallEndIcon/>
            </IconButton>
           </div>


        <div className="conferenceView">
            
           {videos.map((video)=>(
            <div className="videomeetxy" key={video.socketId}>
                
                <video
                    ref={(element) => {
                        if (element && video.stream) {
                            element.srcObject = video.stream;
                        }
                    }}
                    autoPlay
                    playsInline
                  
                />
            </div>
           ))}
           </div>
           </div>
            
        }
    </div>
  );
};

