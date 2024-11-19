import { useState } from 'react'
import { useRoutes, Link, Navigate } from 'react-router-dom'
import './App.css'

import PostPage from './pages/PostPage'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Results from './pages/Results'
import PublicProfile from './pages/PublicProfile'
import { useAuth } from './AuthContext'
import '@fontsource/inter';
import { Avatar, Button } from '@mui/joy'
import ProtectedRoute from './components/ProtectedRoute'
import EditProfileGuard from './components/EditProfileGuard'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import NoAccess from './pages/NoAccess'

function App() {

  const { user } = useAuth();
  const element = useRoutes([
    {
      path: '/',
      element: <Feed />,
    },
    {
      path: '/results',
      element: <Results />,
    },
    {
      // public and personal access with posts
      path: '/profile/:username',
      element: <PublicProfile />,
    },
    {
      path: '/profile/:username/edit',
      element: user ? (
        <EditProfileGuard />
      ) : (
        <Navigate to="/notfound" replace />
      ), // Protect editing routes
    },
    {
      // public and personal access with posts
      path: '/post/:postId',
      element: <PostPage />,
    },
    {
      // public and personal access with posts
      path: '/post/:postId/edit',
      element: <EditPost />,
    },
    {
      // sign in (login)
      // sign up (register) accessed from sign in (login)
      path: '/login',
      element: <Login />,
    },
    {
      // 404
      path: '/notfound',
      element: <NotFound />,
    },
    {
      // 404
      path: '/noaccess',
      element: <NoAccess />,
    },
    {
      // 404
      path: '*',
      element: <NotFound />,
    },
    {
      path: '/add-post',
      element: <CreatePost />
    }, // Add post page
  ]);




  return (
    <>
      <nav>
        <Link to="/">Feed</Link>
        <Link to="/results">Results</Link>
        <Link to={user ? `/profile/${user.username}` : '/login'}>
          {user ? (
            <Avatar
              alt={user.name}
              src={user.avatarUrl} // Replace with actual avatar URL or fallback
              sx={{ width: 40, height: 40 }} // Optional: Avatar styling
            />

          ) : (
            <button>Sign In/Sign Up</button>
          )}

        </Link>

      </nav>
      <div>{element}</div>
      {/* {element} */}
    </>
  )
}

export default App
