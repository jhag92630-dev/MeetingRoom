import React from 'react';
import "../App.css"
import { Link, useNavigate } from 'react-router-dom';
const router = useNavigate();
export default function landing(){
    
    return(
        <div className='landingContainer'>
            <nav class="navbar">
  <div class="logo">MeetingRoom</div>
  <ul class="nav-links">
    <li><a onClick={() => {
                        router("/meet/guest")
                    }}>connect as Guest</a></li>
    <li><a onClick={() => {
                        router("/auth")
                    }} >Register</a></li>
    <li><a onClick={() => {
                        router("/auth")
                    }}>Login</a></li>
  </ul>
</nav>
<div className='row'>
<div style={{fontSize:"2rem"}}>
   <h1><span style={{color:"#ff9839"}}>Connect</span>&nbsp;with your loved ones</h1> 
<br />
<p>From <span style={{color:"#ff9839"}}>Long Distance</span>&nbsp; to MEETING ROOM</p>
<div role='button'> 
    <Link to={"/auth"} >Get Started</Link>
</div>
</div>
<div>
    <img  src='https://images.unsplash.com/photo-1600966878954-39bd28539748?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHZpZGVvJTIwY2FsbHxlbnwwfHwwfHx8MA%3D%3D'/>

</div>
</div>
</div>
    );
}
