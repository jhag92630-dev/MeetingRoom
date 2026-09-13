import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import Authenticate from "./pages/Authentication";
import { AuthProvider } from "./contexts/Authcontext";
import VideoMeetComponent from "./pages/VideoMeet";
import HomeComponent from "./pages/Home";
import History from "./pages/History";
import withAuth from "./utils/WithAuth";



function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Authenticate />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path='/history' element={<History />} />
            <Route path='/meet/:url' element={<VideoMeetComponent />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
