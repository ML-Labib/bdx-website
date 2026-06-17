import { useContext } from 'react';
import { AuthContext } from './authConstants';

export function useAuth() {
    return useContext(AuthContext);
}
