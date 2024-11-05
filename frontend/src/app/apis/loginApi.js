export async function login(username, password) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        username,
        password,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to login');
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}