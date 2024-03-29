// hooks/useNavigateToLocker.js
import { useNavigate } from 'react-router-dom';

const useNavigateToLocker = () => {
  const navigate = useNavigate();

  const navigateToLocker = (lockerName) => {
    // Create a URL-friendly version of the locker name
    const lockerNameSlug = lockerName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/locker/${lockerNameSlug}`);
  };

  return navigateToLocker;
};

export default useNavigateToLocker;
