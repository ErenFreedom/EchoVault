import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import GuestSignUp from './pages/SignUp/GuestSignUp';
import Dashboard from './pages/DashBoard/DashBoard';
import PremiumDashBoard from './pages/DashBoard/PremiumDashBoard';
import GuestDashBoard from './pages/DashBoard/GuestDashBoard'; // Import the Guest Dashboard component
import Locker from './pages/Locker/Locker';
import ProfilePage from './pages/ProfilePage/ProfilePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register-guest" element={<GuestSignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/premium-dashboard" element={<PremiumDashBoard />} />
        <Route path="/guest-dashboard" element={<GuestDashBoard />} /> {/* Guest User Dashboard route */}
        <Route path="/locker/:lockerName" element={<Locker />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Add any additional routes here */}
      </Routes>
    </Router>
  );
};

export default App;
