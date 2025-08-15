import axios from 'axios';
import api from './axios'

export const checkUserLogin = async () => {
  try {
    const response = await api.get('/api/v1/users/current-user', {
      withCredentials: true, // This ensures that cookies are sent with the request
    });
    console.log("User login check response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error checking login status:", error);
    return null;
  }
};
