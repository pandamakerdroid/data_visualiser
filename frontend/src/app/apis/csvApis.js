export async function fetchAvailableCsvs() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    throw new Error("token not found");
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/csvs/all`,{
      headers:{
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch csvs: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching available csvs:", error);
    throw error;
  }
}

export async function fetchCsv(path) {
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
      headers:{
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        return response.status;
      }
      throw new Error(`Failed to fetch csv: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching csv:", error);
    throw error;
  }
}

export async function uploadCsv(formData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/csvs/upload`,
      {
        headers:{
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) {
      if (response.status === 401) {
        return response.status;
      }
      throw new Error(`Failed to upload csv: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading csv:", error);
    throw error;
  }
}