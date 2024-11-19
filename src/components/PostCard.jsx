import React, { useState } from 'react';
import { Card, Typography, Box, Avatar, Button, IconButton, Menu, MenuItem, Modal, Chip, Textarea, ModalDialog, DialogContent, DialogTitle, Stack } from '@mui/joy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { supabase } from '../client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AddIcon from '@mui/icons-material/Add';
import ReplyIcon from '@mui/icons-material/Reply';
import { ModeCommentOutlined, ArrowUpwardOutlined, ArrowDownwardOutlined } from '@mui/icons-material';
// import { ModeCommentOutlined, ArrowUpwardOutlined, ArrowDownwardOutlined, AddIcon, ReplyIcon } from '@mui/icons-material';
import axios from 'axios';
import { useEffect } from 'react';

const PostCard = ({ post, repost, userVote, onVote }) => {
    const { title, content, tags, club, author, upvote_count, downvote_count, created_at, comment_count, media_url } = post;
    const [vote, setVote] = useState(null); // Track user vote (null, 'upvote', or 'downvote')
    const [menuAnchor, setMenuAnchor] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mediaType, setMediaType] = useState(null);
    const [quoteModalOpen, setQuoteModalOpen] = useState(false);
    const [quoteContent, setQuoteContent] = useState('');

    // console.log(author);
    // useEffect(() => {
    //     const fetchMediaType = async (url) => {
    //         try {
    //             const response = await axios.head(url);
    //             const contentType = response.headers['content-type'];
    //             if (contentType.startsWith('image/')) {
    //                 setMediaType('image');
    //             } else if (contentType.startsWith('video/')) {
    //                 setMediaType('video');
    //             } else if (url.match(/(youtube\.com|youtu\.be)/)) {
    //                 setMediaType('youtube');
    //             } else {
    //                 setMediaType('link');
    //             }
    //         } catch (error) {
    //             console.error('Error fetching media type:', error);
    //             setMediaType('link');
    //         }
    //     };

    //     if (media_url) {
    //         fetchMediaType(media_url);
    //     }
    // }, [media_url]);

    // const renderMedia = (url) => {
    //     if (!url) return null;

    //     switch (mediaType) {
    //         case 'youtube':
    //             const videoId = url.split('v=')[1] || url.split('/').pop();
    //             return (
    //                 <iframe
    //                     width="560"
    //                     height="315"
    //                     src={`https://www.youtube.com/embed/${videoId}`}
    //                     frameBorder="0"
    //                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    //                     allowFullScreen
    //                     title="YouTube video player"
    //                 ></iframe>
    //             );
    //         case 'video':
    //             return <video src={url} controls style={{ maxWidth: '100%' }} />;
    //         case 'image':
    //             return <img src={url} alt="Post Media" style={{ maxWidth: '100%' }} />;
    //         default:
    //             return <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>;
    //     }
    // };


    const handleEdit = () => {
        navigate(`/post/${post.id}/edit`);
    };

    const handleDelete = async () => {
        if (user?.id !== author.id) {
            console.error('You are not authorized to delete this post.');
            return;
        }

        const { error } = await supabase.from('posts').delete().eq('id', post.id);
        if (error) {
            console.error('Error deleting post:', error.message);
        } else {
            console.log('Post deleted successfully');
            navigate('/');
        }
        const handleRepost = async (isQuote = false, quoteContent = '') => {
            if (!user) {
                console.error('User must be logged in to repost');
                return;
            }

            const { error } = await supabase.from('reposts').insert({
                post_id: post.id,
                author_id: user.id,
                is_quote: isQuote,
                content: quoteContent,
            });

            if (error) {
                console.error('Error reposting:', error.message);
            } else {
                console.log('Repost successful');
            }
        };
    };

    const handleVote = (type) => {
        if (type === userVote) {
            // If the same vote is clicked, remove the vote
            onVote(post.id, null);
        } else {
            // Otherwise, set the new vote
            onVote(post.id, type);
        }
    };

    const handleRepost = async (isQuote = false, quoteContent = '') => {
        if (!user) {
            console.error('User must be logged in to repost');
            return;
        }

        const { error } = await supabase.from('reposts').insert({
            post_id: post.id,
            author_id: user.id,
            is_quote: isQuote,
            content: quoteContent,
        });

        if (error) {
            console.error('Error reposting:', error.message);
        } else {
            console.log('Repost successful');
            setQuoteModalOpen(false); 
        }
    };

    const openQuoteModal = () => {
        setQuoteModalOpen(true);
    };

    const closeQuoteModal = () => {
        setQuoteModalOpen(false);
        setQuoteContent('');
    };

    const handleQuoteSubmit = () => {
        handleRepost(true, quoteContent);
    };

    return (
        <Card sx={{ my: 2, p: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                <Avatar src={author.avatar_url} alt={author.username} />
                <Box>

                    <Typography>{author.username}</Typography>
                    <Typography level="body2">{new Date(created_at).toLocaleString()}</Typography>
                </Box>
                {user?.id === author.id && (
                    <>
                        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                            <MoreVertIcon />
                        </IconButton>
                        <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                            <MenuItem onClick={handleEdit}>Edit</MenuItem>
                            <MenuItem onClick={handleDelete}>Delete</MenuItem>
                        </Menu>
                    </>
                )}
            </Box>

            <a href={`/post/${post.id}`}>
                {/* Club Logo */}
                {club && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <img src={club.logo} alt={club.name} style={{ width: 30, height: 30 }} />
                        <Typography>{club.name}</Typography>
                    </Box>
                )}
                {/* Content */}
                {/* <Typography level="h5">{title}</Typography>
            <Typography>{content}</Typography> */}

                {/* Content */}
                {repost && (
                    <Box sx={{ mb: 2 }}>
                        {/* <Typography level="body2" color="text.secondary">
                        Reposted by {repost.author.username}
                    </Typography> */}
                        {repost.content && (
                            <Typography level="body2" sx={{ mt: 1 }}>
                                {repost.content}
                            </Typography>
                        )}
                    </Box>
                )}
                <Typography level="h5">{title}</Typography>
                <Typography>{content}</Typography>

                {/* Media */}
                {/* {post.media_url && (
                <Box sx={{ mt: 2 }}>
                    {post.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={post.media_url} controls style={{ maxWidth: '1rem' }} />
                    ) : (
                        <img src={post.media_url} alt="Post Media" style={{ maxWidth: '1rem' }} />
                    )}
                </Box>
            )} */}
                {/* Media */}
                {/* {renderMedia(post.media_url)} */}


                {/* Club */}
                {club?.logo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <img src={club.logo} alt={club.name} style={{ width: 30, height: 30 }} />
                        <Typography>{club.name}</Typography>
                    </Box>
                )}



                {/* Tags */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {tags.map((tag) => (
                        <Chip key={tag} variant="outlined" size="sm">
                            {tag}
                        </Chip>
                    ))}
                </Box>
            </a>
            {/* Voting */}
            <Box sx={{ display: 'flex', mt: 2 }}>
                <Button
                    variant={userVote === 1 ? 'solid' : 'outlined'} // Highlight upvote if userVote is 1
                    onClick={() => onVote(post.id, userVote === 1 ? null : 1)} // Toggle upvote
                >
                    <ArrowUpwardOutlined /> {upvote_count}
                </Button>
                <Button
                    variant={userVote === -1 ? 'solid' : 'outlined'} // Highlight downvote if userVote is -1
                    onClick={() => onVote(post.id, userVote === -1 ? null : -1)} // Toggle downvote
                >
                    <ArrowDownwardOutlined /> {downvote_count}
                </Button>


                <Button variant="outlined" onClick={() => navigate(`/post/${post.id}`)}>
                    <ModeCommentOutlined /> {comment_count}
                </Button>
                <Button onClick={() => handleRepost(false)}>
                    <ReplyIcon />
                    Repost
                </Button>



                {/* <Button
                    variant={userVote === 1 ? 'soft' : 'outlined'}
                    onClick={() => handleVote(1)}
                >
                    <ArrowUpwardOutlined/> ({upvote_count + (userVote === 1 ? 1 : 0)})
                </Button>
                <Button
                    variant={userVote === -1 ? 'soft' : 'outlined'}
                    onClick={() => handleVote(-1)}
                >
                    <ArrowDownwardOutlined/> ({downvote_count + (userVote === -1 ? 1 : 0)})
                </Button> */}

            </Box>

            {/* Quote Modal */}
            <React.Fragment>
                {/* Button to open the modal */}
                <Button
                    variant="outlined"
                    color="neutral"
                    startDecorator={<AddIcon />}
                    onClick={() => setQuoteModalOpen(true)}
                >
                    Add Quote
                </Button>

                {/* Modal for adding quotes */}
                <Modal open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)}>
                    <ModalDialog>
                        <DialogTitle>Add a Quote</DialogTitle>
                        <DialogContent>
                            <Typography level="body2" mb={1}>
                                Share your thoughts or a quote about this post.
                            </Typography>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault(); // Prevent form reload
                                    handleQuoteSubmit(); // Submit quote
                                }}
                            >
                                <Stack spacing={2}>
                                    <Textarea
                                        required
                                        autoFocus
                                        minRows={3}
                                        placeholder="Type your quote here..."
                                        value={quoteContent}
                                        name='quoteContent'
                                        onChange={(e) => setQuoteContent(e.target.value)}
                                        sx={{ width: '100%' }}
                                    />
                                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            color="neutral"
                                            onClick={() => {
                                                setQuoteModalOpen(false); // Close modal
                                                setQuoteContent(''); // Reset quote content
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="solid" color="primary">
                                            Submit
                                        </Button>
                                    </Stack>
                                </Stack>
                            </form>
                        </DialogContent>
                    </ModalDialog>
                </Modal>
            </React.Fragment>

        </Card>
    );
};

export default PostCard;
