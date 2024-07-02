import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://wiseish.in/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Increase timeout to 30 seconds
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.log('Error response:', error.response);
        } else if (error.request) {
            console.log('Error request:', error.request);
        } else {
            console.log('Error message:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
