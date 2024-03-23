import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
// Import other pages/components here

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

export default App;
