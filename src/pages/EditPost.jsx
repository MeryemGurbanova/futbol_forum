import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    FormLabel,
    Input,
    Sheet,
    Chip,
} from '@mui/joy';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client';
import { useAuth } from '../AuthContext';

const tagsOptions = [
    'Opinion',
    'Question',
    'News/Announcement',
    'Meme',
    'Stats/Analysis',
    'Other',
    'Meetup',
    'Rant',
];

const EditPost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        media_url: '',
        club: '',
        tags: [],
    });
    const [postMeta, setPostMeta] = useState({
        upvote_count: 0,
        downvote_count: 0,
        created_at: '',
        edited_at: '',
    });
    const [clubSuggestions, setClubSuggestions] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch the post data when the component loads
    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
          id, title, content, media_url, tags, upvote_count, downvote_count, created_at, edited_at,
          club:clubs(name, logo)
        `)
                .eq('id', postId)
                .single();

            if (error) {
                console.error('Error fetching post:', error.message);
                setError('Could not fetch the post. Please try again.');
                return;
            }

            // Populate form data
            setFormData({
                title: data.title,
                content: data.content,
                media_url: data.media_url,
                club: data.club?.name || '',
                tags: data.tags || [],
            });
            setPostMeta({
                upvote_count: data.upvote_count,
                downvote_count: data.downvote_count,
                created_at: data.created_at,
                edited_at: data.edited_at,
            });
            setSelectedClub(data.club || null);
        };

        fetchPost();
    }, [postId]);

    // Handle input changes for title, content, media_url
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Fetch club suggestions
    const handleClubSearch = async (e) => {
        const searchTerm = e.target.value;
        setFormData({ ...formData, club: searchTerm });
        if (searchTerm.length > 2) {
            const response = await fetch(
                `https://v3.football.api-sports.io/teams?search=${searchTerm}`,
                {
                    headers: {
                        'x-rapidapi-host': 'v3.football.api-sports.io',
                        'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
                    },
                }
            );
            const { response: teams } = await response.json();
            setClubSuggestions(
                teams.map((team) => ({
                    name: team.team.name,
                    logo: team.team.logo,
                }))
            );
        } else {
            setClubSuggestions([]);
        }
    };

    // Handle club selection
    const handleClubSelect = (club) => {
        setSelectedClub(club);
        setFormData({ ...formData, club: club.name });
        setClubSuggestions([]);
    };

    // Handle tag toggling
    const handleTagToggle = (tag) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((t) => t !== tag) 
                : [...prev.tags, tag],
        }));
    };

    // Handle post update
    const handleUpdatePost = async (e) => {
        e.preventDefault();
        const { title, content, media_url, tags } = formData;

        const club_name = selectedClub ? selectedClub.name : null;
        const club_logo = selectedClub ? selectedClub.logo : null;

        try {
            let club_id = null;

            if (club_name && club_logo) {
                // Upsert club if selected
                const { data: clubData, error: clubError } = await supabase.rpc('upsert_club', {
                    club_name,
                    club_logo,
                });

                if (clubError) {
                    console.error('Error upserting club:', clubError.message);
                    setError('Failed to associate club. Please try again.');
                    return;
                }
                club_id = clubData;
            }

            // Update the post
            const { error: updateError } = await supabase
                .from('posts')
                .update({
                    title,
                    content,
                    media_url,
                    tags,
                    club_id,
                    edited_at: new Date(), 
                })
                .eq('id', postId);

            if (updateError) {
                console.error('Error updating post:', updateError.message);
                setError('Failed to update post. Please try again.');
                return;
            }


            setSuccess(true);
            navigate(`/post/${postId}`);
        } catch (err) {
            console.error('Error updating post:', err.message);
            setError('Unexpected error occurred. Please try again.');
        }
    };

    return (
        <Sheet
            sx={{
                maxWidth: 800,
                mx: 'auto',
                mt: 4,
                py: 3,
                px: 4,
                borderRadius: 'md',
                boxShadow: 'lg',
            }}
        >
            <Typography level="h4" component="h1" textAlign="center">
                Edit Post
            </Typography>
            {error && (
                <Typography level="body2" color="danger" textAlign="center">
                    {error}
                </Typography>
            )}
            {success && (
                <Typography level="body2" color="success" textAlign="center">
                    Post updated successfully!
                </Typography>
            )}

            {/* Post Metadata */}
            <Box sx={{ my: 2 }}>
                <Typography level="body2">
                    Created At: {new Date(postMeta.created_at).toLocaleString()}
                </Typography>
                {postMeta.edited_at && (
                    <Typography level="body2">
                        Last Edited: {new Date(postMeta.edited_at).toLocaleString()}
                    </Typography>
                )}
                <Typography level="body2">
                    Upvotes: {postMeta.upvote_count} | Downvotes: {postMeta.downvote_count}
                </Typography>
            </Box>

            <form onSubmit={handleUpdatePost}>
                <FormControl required>
                    <FormLabel>Title</FormLabel>
                    <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter a catchy title"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Content</FormLabel>
                    <Input
                        type="text"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Write your post content here..."
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Media URL</FormLabel>
                    <Input
                        type="url"
                        name="media_url"
                        value={formData.media_url}
                        onChange={handleInputChange}
                        placeholder="Link to an image or GIF (optional)"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Club</FormLabel>
                    <Input
                        type="text"
                        placeholder="Search for a club"
                        value={formData.club}
                        onChange={handleClubSearch}
                    />
                    <Box sx={{ mt: 1, position: 'relative' }}>
                        {clubSuggestions.length > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    zIndex: 10,
                                    backgroundColor: 'white',
                                    borderRadius: 'sm',
                                    boxShadow: 'lg',
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    width: '100%',
                                }}
                            >
                                {clubSuggestions.map((club) => (
                                    <Box
                                        key={club.name}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            padding: '8px',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: '#f0f0f0',
                                            },
                                        }}
                                        onClick={() => handleClubSelect(club)}
                                    >
                                        <img src={club.logo} alt={club.name} style={{ width: 30, height: 30 }} />
                                        <Typography>{club.name}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </FormControl>
                <FormControl>
                    <FormLabel>Tags</FormLabel>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {tagsOptions.map((tag) => (
                            <Chip
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                variant={formData.tags.includes(tag) ? 'solid' : 'outlined'}
                                sx={{ cursor: 'pointer' }}
                            >
                                {tag}
                            </Chip>
                        ))}
                    </Box>
                </FormControl>
                <Button type="submit" fullWidth sx={{ mt: 2 }}>
                    Update Post
                </Button>
            </form>
        </Sheet>
    );
};

export default EditPost;
