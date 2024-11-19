import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    FormLabel,
    Input,
    Sheet,
    Snackbar,
} from '@mui/joy';
import { supabase } from '../client';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

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

const CreatePost = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        media_url: '',
        club: '',
        tags: [],
    });
    const [clubSuggestions, setClubSuggestions] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    // let club_name = null;
    // let club_logo = null;
    let global_club = null;

    // Fetch clubs from API-Football
    const fetchClubs = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 3) return;
        const response = await fetch(
            `https://v3.football.api-sports.io/teams?search=${searchTerm}`,
            {
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY, // Replace with your actual API key
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
        
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleClubSearch = async (e) => {
        const searchTerm = e.target.value;
        setFormData({ ...formData, club: searchTerm }); // Update the `club` field with the typed value
        if (searchTerm.length > 2) {
            await fetchClubs(searchTerm); // Fetch suggestions
        } else {
            setClubSuggestions([]); // Clear suggestions for shorter input
        }
    };

    const handleClubSelect = (club) => {
        console.log('Selected club in handler:', club);
        setSelectedClub(club); // Store the selected club
        setFormData({ ...formData, club: club.name }); // Update the `club` field with the selected value
        
        // club_name = club.name;
        // club_logo = club.logo;
        setClubSuggestions([]); // Clear suggestions after selection
    };
    const handleTagToggle = (tag) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((t) => t !== tag) // Deselect tag
                : [...prev.tags, tag], // Add tag
        }));
    };

    const handleCreatePost = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        const { title, content, media_url, tags, club } = formData;

        // Find the selected club details (name and logo)
        // const selectedClub = clubSuggestions.find((c) => c.name === club);

        // console.log('Selected club outside:', selectedClub);
        // console.log('Global club outside:', global_club);
        
        const club_name = selectedClub ? selectedClub.name : null;
        const club_logo = selectedClub ? selectedClub.logo : null;

        try {
            let club_id = null;

            // Step 1: Upsert club if a club is selected
            console.log('Upserting club:', club_name, club_logo); //// club_name and club_logo are always null why? 
            if (club_name && club_logo) {
                let { data: clubData, error: clubError } = await supabase.rpc('upsert_club', {
                    club_name: club_name,
                    club_logo: club_logo,
                });

                if (clubError) {
                    console.error('Error upserting club:', clubError.message);
                    setError('Failed to associate club. Please try again.');
                    return;
                }
                console.log('Club data:', clubData);
                club_id = clubData;
            }

            // Step 2: Insert the post
            const { error: postError } = await supabase.from('posts').insert({
                title,
                content,
                media_url,
                tags,
                club_id,
                author_id: user.id, // Ensure to link the post to the logged-in user
            });

            if (postError) {
                console.error('Error adding post:', postError.message);
                setError('Failed to create post. Please try again.');
                return;
            }

            // Success feedback
            setSuccess(true);
            setError(null);
            setFormData({
                title: '',
                content: '',
                media_url: '',
                club: '',
                tags: [],
            });
            setClubSuggestions([]);
            navigate('/');
            // snackbar.open('Post created successfully!');

        } catch (err) {
            console.error('Error creating post:', err.message);
            setError('Unexpected error occurred. Please try again.');
        }
    };



    return (
        <Sheet
            sx={{
                maxWidth: 600,
                mx: 'auto',
                mt: 4,
                py: 3,
                px: 4,
                borderRadius: 'md',
                boxShadow: 'lg',
            }}
        >
            <Typography level="h4" component="h1" textAlign="center">
                Create a New Post
            </Typography>
            {error && (
                <Typography level="body2" color="danger" textAlign="center">
                    {error}
                </Typography>
            )}
            {success && (
                <Typography level="body2" color="success" textAlign="center">
                    Post created successfully!
                </Typography>
            )}
            <form onSubmit={handleCreatePost}>
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
                                        onClick={() => {handleClubSelect(club); console.log(club)}}
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
                            <Button
                                key={tag}
                                variant={formData.tags.includes(tag) ? 'soft' : 'outlined'}
                                onClick={() => handleTagToggle(tag)}
                                sx={{
                                    backgroundColor: formData.tags.includes(tag) ? '#007BFF' : 'transparent',
                                    color: formData.tags.includes(tag) ? 'white' : 'inherit',
                                }}
                            >
                                {tag}
                            </Button>
                        ))}
                    </Box>
                </FormControl>
                <Button type="submit" fullWidth sx={{ mt: 2 }}>
                    Submit Post
                </Button>
            </form>
        </Sheet>
    );
};

export default CreatePost;
