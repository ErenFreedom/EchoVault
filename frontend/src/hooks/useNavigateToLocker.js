// hooks/useNavigateToLocker.js
import { useNavigate } from 'react-router-dom';

const useNavigateToLocker = () => {
    const navigate = useNavigate();

    const navigateToLocker = (lockerId, lockerName) => {
        // You can use a slugify function to convert lockerName to a URL friendly version
        const lockerNameSlug = lockerName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/locker/${lockerId}/${lockerNameSlug}`);
    };

    return navigateToLocker;
};

export default useNavigateToLocker;
