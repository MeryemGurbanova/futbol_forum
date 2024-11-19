import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Sheet,
  ToggleButtonGroup,
  Stack,
} from '@mui/joy';
import { useAuth } from '../AuthContext'; 

function AuthForm() {
  const { signin, signup } = useAuth(); 
  const [mode, setMode] = useState('login'); 
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleModeChange = (_, newMode) => {
    if (newMode) setMode(newMode);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        console.log('Attempting login...');
        await signin(formData.username, formData.password);
        alert('Login successful!');
        console.log('Login successful!');
      } else {
        console.log('Attempting sign-up...');
        await signup(formData.username, formData.password);
        alert('Sign-up successful!');
        console.log('Sign-up successful!');
      }
    } catch (error) {
      console.error('Error during authentication:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Sheet
      sx={{
        maxWidth: 500,
        mx: 'auto',
        mt: 4,
        py: 3,
        px: 4,
        borderRadius: 'md',
        boxShadow: 'lg',
      }}
    >
      <Typography level="h4" component="h1" textAlign="center">
        {mode === 'login' ? 'Sign In' : 'Sign Up'}
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive="true"
        onChange={handleModeChange}
        sx={{ my: 2, display: 'flex', justifyContent: 'center' }}
      >
        <Button value="login">Login</Button>
        <Button value="signup">Sign Up</Button>
      </ToggleButtonGroup>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <FormControl required>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </FormControl>
          <Button type="submit" fullWidth>
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </Stack>
      </form>
    </Sheet>
  );
}

export default AuthForm;
