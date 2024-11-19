import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import EditPage from '../pages/EditPage';

function EditPostGuard() {
    const { id } = useParams();
    const { user } = useAuth();

    if (!user || user.username !== username) {
        return <Navigate to="/notfound" replace />;
    }

    return <EditPage />;
}

export default EditPostGuard;
