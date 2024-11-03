'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, FormControl, Typography,TextField } from '@mui/material';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken]=useState('');
  const router = useRouter();

  useEffect(()=>{
    if(token!==undefined && token !==null){
      sessionStorage.setItem('token', token);
    }
  },[token])

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      setToken(response.data.access_token);
      router.push('/upload');
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <Container>
      <FormControl style={{width:640, verticalAlign:'middle'}}>
        <Typography style={{background:'green'}} variant='h2'>Login</Typography>
        <TextField
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={username.length<3 || password.length<3} 
        onClick={handleLogin}>Login</Button>
      </FormControl>
    </Container>
  );
}
