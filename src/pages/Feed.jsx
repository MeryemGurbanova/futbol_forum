import React, { useEffect, useState } from 'react';
import { Box, Typography, Input, Button } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import PostCard from '../components/PostCard'; // Import PostCard component
import { supabase } from '../client';
import { Link } from 'react-router-dom';
import { Fab } from '@mui/material';
import { useAuth } from '../AuthContext';
import ModeCommentOutlined from '@mui/icons-material/ModeCommentOutlined';
import RepostCard from '../components/RepostCard';


const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [userVote, setUserVote] = useState(null);
  const [reposts, setReposts] = useState([]);
  const filterTags = ['Opinion', 'Question', 'News/Announcement', 'Meme', 'Stats/Analysis', 'Other', 'Meetup', 'Rant',
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sortBy, setSortBy] = useState('created_at'); // Default to sorting by created_at



  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, content, media_url, tags, created_at,
          upvote_count, downvote_count,
          author:users(id, username, avatar_url),
          club:clubs(name, logo)
      `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error.message);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };
    const fetchReposts = async () => {
      const { data: repostsData, error: repostsError } = await supabase
        .from('reposts')
        .select('*, post:posts(*), author:users(id, username, avatar_url)');
      if (repostsError) {
        console.error('Error fetching reposts:', repostsError.message);
      } else {
        setReposts(repostsData);
      }
    };

    // UseEffect to fetch posts
    fetchPosts();
    fetchReposts();


  }, []);



  // Handle user votes
  const handleVote = async (postId) => {
    try {
      // Fetch the current upvote_count from the database
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('upvote_count')
        .eq('id', postId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching current upvote count:', fetchError.message);
        return;
      }

      const currentUpvoteCount = data.upvote_count || 0; // Default to 0 if undefined
      const newUpvoteCount = currentUpvoteCount + 1; // Increment locally

      // Optimistic UI update
      const updatedPosts = posts.map((post) =>
        post.id === postId ? { ...post, upvote_count: newUpvoteCount } : post
      );
      setPosts(updatedPosts);

      // Update the new upvote_count in the database
      const { error: updateError } = await supabase
        .from('posts')
        .update({ upvote_count: newUpvoteCount }) // Send the new count
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating upvote count:', updateError.message);
        // Revert optimistic update in case of error
        setPosts(posts);
      }
    } catch (err) {
      console.error('Error handling upvote:', err.message);
    }
  };


  const getFilteredAndSortedPosts = () => {
    // Start with the unfiltered list
    let filteredPosts = [...posts];

    // Apply search filter
    if (searchTerm) {
      filteredPosts = filteredPosts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filteredPosts = filteredPosts.filter((post) =>
        selectedTags.every((tag) => post.tags.includes(tag))
      );
    }

    // Filter by team/club
    if (selectedTeam) {
      filteredPosts = filteredPosts.filter((post) => post.club?.name === selectedTeam);
    }

    // Sort posts
    filteredPosts.sort((a, b) => {
      if (sortBy === 'upvote_count') {
        return b.upvote_count - a.upvote_count; // Sort by votes (descending)
      } else if (sortBy === 'downvote_count') {
        return b.downvote_count - a.downvote_count; // Sort by downvotes (descending)
      } else {
        return new Date(b.created_at) - new Date(a.created_at); // Default: Sort by creation date
      }
    });

    return filteredPosts;
  };









  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        mt: 4,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >

      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Search Bar */}
        <Input
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 400 }}
        />

        {/* Tag Filter */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {filterTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'solid' : 'outlined'}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag) // Remove tag if already selected
                    : [...prev, tag] // Add tag if not selected
                )
              }
            >
              {tag}
            </Button>
          ))}
        </Box>

        {/* Team Filter */}
        <Input
          placeholder="Filter by team..."
          value={selectedTeam || ''}
          onChange={(e) => setSelectedTeam(e.target.value)}
          sx={{ maxWidth: 400 }}
        />

        {/* Sort By */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>Sort by:</Typography>
          <Button
            variant={sortBy === 'created_at' ? 'solid' : 'outlined'}
            onClick={() => setSortBy('created_at')}
          >
            Date
          </Button>
          <Button
            variant={sortBy === 'upvote_count' ? 'solid' : 'outlined'}
            onClick={() => setSortBy('upvote_count')}
          >
            Upvotes
          </Button>
          <Button
            variant={sortBy === 'downvote_count' ? 'solid' : 'outlined'}
            onClick={() => setSortBy('downvote_count')}
          >
            Downvotes
          </Button>
        </Box>
      </Box>


      {/* Page Header */}
      <Typography level="h4" component="h1" textAlign="center">
        Feed
      </Typography>

      {/* Posts List */}
      {loading ? (
        <Typography level="body1" textAlign="center">
          Loading posts...
        </Typography>
      ) : posts.length === 0 ? (
        <Typography level="body1" textAlign="center">
          No posts yet. Be the first to create one!
        </Typography>
      ) : (
        <>
          {getFilteredAndSortedPosts().map((post) => (

            <PostCard key={post.id} post={post} userVote={post.userVote} onVote={handleVote} />

          ))}

          {reposts && reposts.map((repost) => (

            <RepostCard key={repost.id} post={repost.post} repost={repost} userVote={repost.userVote} author={repost.author} onVote={handleVote} /> 
          ))}
        </>
      )}

      {/* Floating Action Button */}
      <Fab
        component={Link}
        to="/add-post"
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Feed;
