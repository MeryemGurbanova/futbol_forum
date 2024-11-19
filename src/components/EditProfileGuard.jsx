import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import EditProfile from '../pages/EditProfile';

function EditProfileGuard() {
    const { username } = useParams();
    const { user } = useAuth();

    if (!user || user.username !== username) {
        
        return <Navigate to="/noaccess" replace />;
    }

    return <EditProfile />;
}

export default EditProfileGuard;
