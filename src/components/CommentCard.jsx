import React from 'react';
import { Card, Typography, Box, Avatar } from '@mui/joy';


const CommentCard = ({ comment }) => {
    const { author, content, created_at } = comment;
    console.log(author);

    return (
        <Card variant="outlined" sx={{ my: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={author.avatar_url || author.username} alt={author.username} />
                <Box>
                    <Typography level="body1" fontWeight="bold">
                        {author.username}
                    </Typography>
                    <Typography level="body2" color="text.secondary">
                        {new Date(created_at).toLocaleString()}
                    </Typography>
                </Box>
            </Box>
            <Typography level="body2" mt={2}>
                {content}
            </Typography>
        </Card>
    );
};

export default CommentCard;