// profile info with links to edit
// --- Name
// --- Password
// --- Residency public/private
// --- Club
// delete account button

// posts sorted by most recent

import React from 'react'
import { Button } from '@mui/joy'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'

const EditProfile = () => {
  const {username} = useParams()   
  const navigate = useNavigate()
  const handleSave = () =>{
  
    console.log("Changes saved")
  }
  const handleDiscard = () =>{
    navigate(`/profile/${username}`)
  }
  return (
    <>
    <div>
      Edit Page
    </div>
    <Button onClick={()=>handleSave()} >Save changes</Button>
    <Button onClick={()=>handleDiscard()} >Discard Changes</Button>
    </>
  )
}

export default EditProfile
