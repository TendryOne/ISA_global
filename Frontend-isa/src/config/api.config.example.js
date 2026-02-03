// Configuration API - Frontend ISA
// Fichier: src/config/api.config.js ou api.config.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.isa-ambato.mg';
const API_VERSION = '/api/v1';

export const API_CONFIG = {
    baseURL: `${API_BASE_URL}${API_VERSION}`,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
};

// Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',

    // Students
    STUDENTS: '/students',
    STUDENT_BY_ID: (id) => `/students/${id}`,

    // Professors
    PROFESSORS: '/professors',

    // Modules
    MODULES: '/modules',

    // etc...
};

// Usage avec axios:
// import axios from 'axios';
// import { API_CONFIG } from '@/config/api.config';
//
// const api = axios.create(API_CONFIG);
//
// // Appel: https://api.isa-ambato.mg/api/v1/students
// api.get('/students');
