// Navbar with conditional rendering of profile link : sign in/sign up
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
impo

const Navbar = () => {
    const { user } = useAuth();
    return (
        <>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/feed">Feed</Link>
            <Link to="/results">Results</Link>
            
        </nav>
        <div>{element}</div>
        </>
    )
}

export default Navbar
