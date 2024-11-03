export async function fetchAvailableCsvs() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/csvs/all`);
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
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`);
    if (!response.ok) {
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
            method: "POST",
            body: formData,
          }
        );
        if (!response.ok) {
          throw new Error(`Failed to upload csv: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error uploading csv:", error);
        throw error;
      }
}