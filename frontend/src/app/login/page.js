'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Container, FormControl, Typography, TextField } from '@mui/material';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      setToken(token);
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <Container>
      <FormControl style={{ width: 640, verticalAlign: 'middle' }}>
        <Typography style={{ background: 'green' }} variant="h2">
          Login
        </Typography>
        <TextField
          placeholder="Username, use testuser"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          type="password"
          placeholder="Password, use password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={username.length < 3 || password.length < 3} onClick={handleLogin}>
          Login
        </Button>
      </FormControl>
      {token && countdown > 0 && (
        <Typography variant="h6" style={{ marginTop: '20px', color: 'green' }}>
          Redirecting in {countdown}...
        </Typography>
      )}
    </Container>
  );
}
