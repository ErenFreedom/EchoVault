import React, { useState } from 'react';
import './permission.css'; 

const Permission = () => {
  const [formData, setFormData] = useState({
    dummyUserEmail: '',
    lockerName: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/permissions/assign-permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
       
      },
      body: JSON.stringify({
        dummyUserEmail: formData.dummyUserEmail,
        lockerName: formData.lockerName,
        password: formData.password, 
      }),
    });

    if (response.ok) {
      alert('Permissions assigned successfully.');
    } else {
      const errorData = await response.json();
      alert(`Failed to assign permissions: ${errorData.message}`);
    }
  };

  return (
    <div className="permission-container">
      <h2>Assign Permissions</h2>
      <form onSubmit={handleSubmit} className="permission-form">
        <input
          type="email"
          name="dummyUserEmail"
          placeholder="Dummy User Email"
          value={formData.dummyUserEmail}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lockerName"
          placeholder="Locker Name"
          value={formData.lockerName}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Your Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="assign-permission-button">Confirm</button>
      </form>
    </div>
  );
};

export default Permission;
