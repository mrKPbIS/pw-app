'use client';

import { jwtDecode } from 'jwt-decode';

export const saveToken = (token: string) => {
  const credentials = jwtDecode<{ id: string; email: string }>(token);
  localStorage.setItem('auth-token', token);
  localStorage.setItem('auth-user', JSON.stringify(credentials));
}

export const getToken = () => {
  return localStorage.getItem('auth-token');
}

export const isAuthentificated = () => {
  const token = getToken();
  return token !== null;
}

export const getUser = () => {
  const user = localStorage.getItem('auth-user');
  console.log('user', user);
  return !user? { userId: null, email: ''}: JSON.parse(user);
}

export const logout = () => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('auth-user');
}

