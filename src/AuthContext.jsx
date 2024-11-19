import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Fetch user metadata from the `users` table
    const fetchUser = async (supabaseUser) => {
        if (!supabaseUser || !supabaseUser.id) {
            console.error('fetchUser error: Invalid supabaseUser object', supabaseUser);
            throw new Error('Invalid supabaseUser object');
        }

        console.log('Fetching metadata for:', supabaseUser.id);
        const { data: userData, error } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', supabaseUser.id)
            .single();

        if (error) {
            console.error('Error fetching metadata:', error.message);
            return supabaseUser; // Return basic user data if metadata fetch fails
        }

        console.log('User metadata:', userData);
        return { ...supabaseUser, ...userData };
    };

    useEffect(() => {
        let isMounted = true;

        const fetchSession = async () => {
            const { data: session, error } = await supabase.auth.getSession();
            if (isMounted) {
                console.log('Session on app load:', session, error);
            }

            if (error) {
                console.error('Error fetching session:', error.message);
                return;
            }

            if (isMounted) {
                if (session?.session?.user) {
                    console.log('Session exists. Fetching user metadata...');
                    const fullUser = await fetchUser(session.session.user);
                    setUser(fullUser);
                } else {
                    console.log('No session found.');
                    setUser(null);
                }
            }
        };

        fetchSession();

        return () => {
            isMounted = false;
        };
    }, []);

    // Signup method
    const signup = async (username, password) => {
        console.log('Signing up...');
        const { data, error } = await supabase.auth.signUp({
            email: `${username}@example.com`, // Fake email
            password,
            options: {
                data: { username }, // Save username in user metadata
            },
        });
    
        console.log('Signup response:', data, error);
    
        if (error) {
            console.error('Signup error:', error.message);
            throw error;
        }
    
        const user = data.user;
        if (!user) {
            console.error('Signup failed: User object is missing');
            throw new Error('Signup failed: User object is missing');
        }
    
        const fullUser = await fetchUser(user);
        setUser(fullUser);
        navigate(`/profile/${fullUser.username}`);
    };
    

    // Login method
    const signin = async (username, password) => {
        try {
            console.log('Starting login process...');
            const { data, error } = await supabase.auth.signInWithPassword({
                email: `${username}@example.com`,
                password,
            });
            console.log('Login response:', data, error);

            if (error) {
                console.error('Login error:', error.message);
                throw error;
            }

            const user = data.user;
            if (!user) {
                console.error('Login failed: User object is missing');
                throw new Error('Login failed: User object is missing');
            }

            console.log('Fetching user metadata...');
            const fullUser = await fetchUser(user);
            console.log('User fetched:', fullUser);
            setUser(fullUser);
            navigate(`/profile/${fullUser.username}`);
        } catch (error) {
            console.error('Error during login:', error.message);
            throw error;
        }
    };

    // Logout method
    const signout = async () => {
        console.log('Signing out...');
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            console.log('Signed out successfully.');
            setUser(null);
            navigate('/');
        }
    };

    const value = {
        user,
        signup,
        signin,
        signout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
