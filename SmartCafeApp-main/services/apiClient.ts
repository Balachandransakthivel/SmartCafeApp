import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Dynamically scale API routes depending on simulator selection
// Web emulator safely bypasses Windows Firewall by tunneling via localhost
const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api'
  : 'http://10.133.108.167:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token securely before requests are sent
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Pulling token from local cache perfectly preserving offline functionality strategy
      const userInfo = await AsyncStorage.getItem('@smart_cafe_user');
      
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      }
    } catch (error) {
      console.error('Error fetching token for API request', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor allows us to globally catch unauthorized routes to push users to login if token is expired
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("API Token expired or unauthorized - Should trigger logout flow.");
      // Optional: Clear storage and trigger app navigation to Auth
      // await AsyncStorage.removeItem('@smart_cafe_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
