import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import { Box, Typography, Textarea, Button, Stack, Avatar, IconButton } from '@mui/joy';
import { useAuth } from '../AuthContext';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        console.error('Invalid postId');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, content, media_url, created_at,
          author:users(id, username, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        console.error('Error fetching post:', error.message);
      } else {
        setPost(data);
      }
    };

    const fetchComments = async () => {
      if (!postId) {
        console.error('Invalid postId for fetching comments');
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          author:users(id, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error.message);
      } else {
        setComments(data || []);
      }
    };

    fetchPost();
    fetchComments();
  }, [postId]);

  const addComment = async () => {
    if (!user) {
      console.error('User must be logged in to add a comment');
      return;
    }

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      content: newComment,
    });

    if (error) {
      console.error('Error adding comment:', error.message);
    } else {
      setComments((prevComments) => [
        {
          id: new Date().getTime(),
          author: {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
          },
          content: newComment,
          created_at: new Date().toISOString(),
        },
        ...prevComments,
      ]);
      setNewComment('');
    }
  };

  const deleteComment = async (commentId) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error.message);
    } else {
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    }
  };

  if (!post) return <Typography>Loading post...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      {/* Post Content */}
      <Box mb={4}>
        <Typography level="h2">{post.title}</Typography>
        <Typography level="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          {post.content}
        </Typography>
        {post.media_url && (
          <img src={post.media_url} alt="Post Media" style={{ maxWidth: '100%', marginTop: '16px' }} />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
          <Avatar
            src={post.author?.avatar_url}
            alt={post.author?.username}
            size="lg"
            onClick={() => navigate(`/profile/${post.author?.id}`)}
            sx={{ cursor: 'pointer' }}
          />
          <Typography level="body1" fontWeight="bold">
            {post.author?.username}
          </Typography>
        </Box>
      </Box>

      {/* Comment Input */}
      <Stack spacing={2}>
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button onClick={addComment} variant="solid" color="primary">
          Add Comment
        </Button>
      </Stack>

      {/* Comments Section */}
      <Box mt={4}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Box
              key={comment.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                mb: 2,
                p: 2,
                borderRadius: 'md',
                backgroundColor: '#f9f9f9',
              }}
            >
              <Avatar
                src={comment.author.avatar_url}
                alt={comment.author.username}
                size="lg"
                onClick={() => navigate(`/profile/${comment.author.id}`)}
                sx={{ cursor: 'pointer' }}
              />
              <Box flex={1}>
                <Typography level="body1" fontWeight="bold">
                  {comment.author.username}
                </Typography>
                <Typography level="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {new Date(comment.created_at).toLocaleString()}
                </Typography>
                <Typography>{comment.content}</Typography>
              </Box>
              {/* Show Delete Button for Comment Author or Post Author */}
              {(user?.id === comment.author.id || user?.id === post.author.id) && (
                <IconButton
                  onClick={() => deleteComment(comment.id)}
                  size="sm"
                  variant="plain"
                  color="danger"
                >
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Box>
          ))
        ) : (
          <Typography>No comments yet. Be the first to comment!</Typography>
        )}
      </Box>
    </Box>
  );
};

export default PostPage;
