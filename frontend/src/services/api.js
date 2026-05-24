import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT Token to every request safely
API.interceptors.request.use((req) => {
  try {
    // We now grab the exact 'token' key we saved in AppContext
    const token = localStorage.getItem('token');
    
    // Safely verify it exists and isn't the word "undefined"
    if (token && token !== 'undefined' && token !== 'null') {
      req.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Axios Interceptor Error:", error);
  }
  return req;
}, (error) => {
  return Promise.reject(error);
});

// --- Auth Routes ---
export const loginUser = (formData) => API.post('/auth/login', formData);
export const registerUser = (formData) => API.post('/auth/register', formData);

// --- Group & Expense Routes ---
export const createGroup = (groupData) => API.post('/groups', groupData);

// Notice: I changed this to accept `data` so it matches the object we send from the Dashboard
export const joinGroup = (data) => API.post('/groups/join', data); 

export const getGroupData = (groupId) => API.get(`/expenses/${groupId}`);
export const createExpense = (expenseData) => API.post('/expenses', expenseData);

// Profile Updates
export const updateProfile = (data) => API.put('/users/profile', data);
export const updatePassword = (data) => API.put('/users/password', data);

// The Archive / Start Fresh Trigger
export const startNewCycle = (groupId) => API.post(`/groups/${groupId}/archive`);

// Added the settle up route so you can pay people back!
export const settleUp = (settleData) => API.post('/expenses/settle', settleData); 

export default API;