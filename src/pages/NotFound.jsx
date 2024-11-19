import React from 'react'
import { Button } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

const NotFound= () => {
    const navigate = useNavigate()
  return (
    <div>
      404. Or innacessible page.
        <Button onClick={()=>navigate('/')} >Go Back</Button>
    </div>
  )
}

export default NotFound
