import axios from 'axios' 

export default axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL, 
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
}) 

export const axiosPrivate = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
}) 

export const axiosPublic = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
    headers: { 'Content-Type': 'application/json' }
}) 

