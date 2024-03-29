import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import GuestSignUp from './pages/SignUp/GuestSignUp';
import Dashboard from './pages/DashBoard/DashBoard';
import PremiumDashBoard from './pages/DashBoard/PremiumDashBoard';
import Locker from './pages/Locker/Locker'; // Import the Locker component

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
        {/* Add a route for the Locker. Use URL parameters to pass the locker name */}
        <Route path="/locker/:lockerName" element={<Locker />} />
      </Routes>
    </Router>
  );
};

export default App;
