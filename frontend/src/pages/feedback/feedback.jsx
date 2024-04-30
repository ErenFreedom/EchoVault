import React, { useState } from 'react';
import './feedback.css';

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      alert('Please provide both a rating and some feedback.');
      return;
    }

    const feedbackData = {
        rating,     
        content: comment  
      };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify(feedbackData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      alert('Feedback submitted! Thank you.');
      // Reset after submit
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert(error.message || 'An error occurred while submitting feedback.');
    }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-box">
        <h1>Share Your Feedback</h1>
        <div className="star-rating">
          {[...Array(5)].map((star, index) => {
            index += 1;
            return (
              <button
                type="button"
                key={index}
                className={index <= rating ? 'on' : 'off'}
                onClick={() => handleRating(index)}
              >
                &#9733;
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your feedback here (up to 1000 characters)"
            maxLength="1000"
          ></textarea>
          <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
  
  
  
};

export default Feedback;
