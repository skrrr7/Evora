import axios from "axios"

// In production, use your Vercel environment variable. Fallback to local if it's not set.
const BASE_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:5001/api" 
    : `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
    baseURL: BASE_URL
})

export default api;