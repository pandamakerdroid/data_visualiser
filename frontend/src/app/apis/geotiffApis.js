export async function fetchAvailableMaps() {
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/maps/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        return response.status;
      }
      throw new Error(`Failed to fetch maps: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching available maps:", error);
    throw error;
  }
}

export async function uploadMap(formData) {
  const token = sessionStorage.getItem('token');
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/maps/upload`,
      {
        headers: {
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
      throw new Error(`Failed to upload map: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading map:", error);
    throw error;
  }
}