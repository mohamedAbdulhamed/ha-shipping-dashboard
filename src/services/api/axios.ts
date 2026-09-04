import axios from "axios";

// Base URL for the API
const BASE_URL = 'https://hassan-shipping.runasp.net/api';
// const BASE_URL = 'http://shipping-for-test.runasp.net/api';

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});