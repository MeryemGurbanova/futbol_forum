import React from 'react'
import { Button } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

const NoAccess= () => {
    const navigate = useNavigate()
  return (
    <div>
      You do not have access to this page.
        <Button onClick={()=>navigate('/')} >Go Back</Button>
    </div>
  )
}

export default NoAccess
