const BASE_URL = "http://127.0.0.1:5000"; // Flask Backend URL

export const searchMovies = async (title) => {
    try {
        if (!title) throw new Error("Title is required");

        const response = await fetch(`${BASE_URL}/movies?title=${encodeURIComponent(title)}`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - Movie not found`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching movies:", error.message);
        return { error: error.message };
    }
};
