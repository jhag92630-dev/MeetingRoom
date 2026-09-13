import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth=(WrappedComponent)=>{
    const AuthComponent=(props)=>{
        const router=useNavigate();
        const IsAuthenticated=()=>{
        if(localStorage.getItem("token")){
            return true;
        }else{
            return false;
        }
    }
        useEffect(()=>{
            if(!IsAuthenticated()){
                router("/auth");
            }
        },[])


        return <WrappedComponent {...props}/>
    };
    return AuthComponent;
}
export default withAuth;