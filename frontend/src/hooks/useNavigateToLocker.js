import { useNavigate } from 'react-router-dom';

const useNavigateToLocker = () => {
    const navigate = useNavigate();

    const navigateToLocker = (lockerId, lockerName) => {
        const lockerNameSlug = lockerName.toLowerCase().replace(/\s+/g, '-');
        navigate(`/locker/${lockerId}/${lockerNameSlug}`);
    };

    return navigateToLocker;
};

export default useNavigateToLocker;
