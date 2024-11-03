export async function fetchAvailableMaps() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/maps/all`);
      if (!response.ok) {
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
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/maps/upload`,
            {
                method: "POST",
                body: formData,
            }
        );
        if (!response.ok) {
          throw new Error(`Failed to upload map: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error uploading map:", error);
        throw error;
      }
}