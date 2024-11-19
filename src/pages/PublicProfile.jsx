import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import { useAuth } from '../AuthContext';
import { Button } from '@mui/material';
import { useParams, Link } from 'react-router-dom';

const PublicProfile = () => {
  const { user: loggedInUser, signout } = useAuth(); 
  const { username } = useParams();
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true); 

  // Fetch the user profile from the database based on the `username`
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('username, club, residency') 
        .eq('username', username)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  // Render loading state
  if (loading) {
    return <p>Loading profile...</p>;
  }

  // Render not found state
  if (!profile) {
    return <p>Profile not found.</p>;
  }

  // Render the public profile
  return (
    <div>
      <h1>Public Profile</h1>
      <p>Username: {profile.username}</p>
      <p>Clubs: {profile.clubs || 'Not specified'}</p>
      <p>Country: {profile.country || 'Not specified'}</p>

      {/* Posts section */}
      <h2>Posts</h2>
      {/* TODO: Fetch and display posts for this profile */}

      {/* Edit option if logged in user matches the profile */}
      {loggedInUser && loggedInUser.username === username && (
        <div>
          <Link to={`/profile/${username}/edit`}>
            <Button>Edit Profile</Button>
          </Link>
          <Button
            variant="outlined"
            size="small"
            onClick={signout}
          >
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
