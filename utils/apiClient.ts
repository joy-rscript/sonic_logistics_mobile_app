import axios from 'axios';

//  Hoppscotch mock server 
const BASE_URL = 'https://your-hoppscotch-mock-url.com'; 

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiClient;