'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, FormControl, Typography, TextField, Grid2 } from '@mui/material';
import { login } from '../apis/loginApi';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [countdown, setCountdown] = useState(3);
  const router = useRouter();

  useEffect(() => {
    if (token !== undefined && token !== null && token !== '') {
      sessionStorage.setItem('token', token);

      // Start the countdown only if the token is set
      if (sessionStorage.getItem('token') === token) {
        const countdownInterval = setInterval(() => {
          setCountdown((prevCountdown) => {
            if (prevCountdown === 1) {
              clearInterval(countdownInterval);
              router.push('/'); // Redirect after countdown reaches 0
            }
            return prevCountdown - 1;
          });
        }, 1000);
      }
    }
  }, [token, router]);

  const handleSetCredential = () => {
    setUsername('testuser')
    setPassword('password')
  }
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      setToken(token);
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <Container sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
    }}>
      <FormControl sx={{ width: 640 }}>
        <Typography sx={{ my: 2 }} component='h1' variant='h3'>
          Login
        </Typography>
        <TextField
          placeholder='Username, use testuser'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          type='password'
          value={password}
          placeholder='Password, use password'
          onChange={(e) => setPassword(e.target.value)}
        />
        <Grid2 container columns={2} sx={{ mt: 2 }} columnSpacing={2}>
          <Grid2 size={1}>
            <Button sx={{ width: '100%' }} variant='contained' onClick={handleSetCredential}>
              Fillin preset credential
            </Button>
          </Grid2>
          <Grid2 size={1}>
            <Button sx={{ width: '100%' }} variant='contained'
              disabled={username.length < 3 || password.length < 3} onClick={handleLogin}>
              Login
            </Button>
          </Grid2>
        </Grid2>

      </FormControl>
      <Typography variant='h6' sx={{
        height: 5,
        mt: 1,
        color: 'green',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
      }}>
        {token && countdown > 0 && (`Redirecting in ${countdown}...`)}
      </Typography>
    </Container>
  );
}
