import { Avatar, Box, Typography } from '@mui/joy'
import React from 'react'
import { useParams } from 'react-router-dom'
// import Typography from '@mui/joy'

const PostRepostCard = ({ post, author }) => {
    // console.log(post)
    // console.log(author)
    return (
        <div style={{ border: '1px solid black' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={author.avatar_url || author.username} alt={author.username} />
                <Typography level="body1" fontWeight="bold">{author.username}</Typography>
            </Box>
            <Typography level='body2' color='text.secondary'>{post.title}</Typography>
            <Typography level="body1">{post.content}</Typography>

        </div>
    )
}

export default PostRepostCard
