import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import GuestSignUp from './pages/SignUp/GuestSignUp';
import Dashboard from './pages/DashBoard/DashBoard';
import PremiumDashBoard from './pages/DashBoard/PremiumDashBoard';
//import GuestDashBoard from './pages/DashBoard/GuestDashBoard';
import Locker from './pages/Locker/Locker';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import OtpPage from './pages/otpPage/otpPage'; // Import the OtpPage
import ChangePassword from './pages/changePassword/changePassword';
import Payment from './pages/Payment/Payment';
import Permission from './pages/permission/permission';
import Feedback from './pages/feedback/feedback'; 
import { ThemeProvider } from './context/ThemeContext';
// In index.js
import './index.css';


const App = () => {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register-guest" element={<GuestSignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/premium-dashboard" element={<PremiumDashBoard />} />
       
        <Route path="/locker/:lockerId/:lockerName" element={<Locker />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/otp-verification" element={<OtpPage />} /> {/* OtpPage route */}
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/assign-permissions" element={<Permission />} /> {/* Add the Permission route */}
        <Route path="/feedback" element={<Feedback />} /> {/* Feedback route */}

        {/* Add any additional routes here */}
      </Routes>
    </Router>
    </ThemeProvider>
  );
};

export default App;
