import { API_BASE_URL } from '../../constants';

const API_LOGIN_PATH = '/api/auth/login';
const API_REGISTER_PATH = '/api/auth/register';
const API_USERS_PATH = '/api/users';
const API_TRANSACTIONS_PATH = '/api/transactions';

export async function login(email, password) {
  const req = await request(`${API_BASE_URL}${API_LOGIN_PATH}`, 'POST', {}, JSON.stringify({ email, password }));
  return req.json();
}

export async function register(email, name, password) {
  const req = await request(`${API_BASE_URL}${API_REGISTER_PATH}`, 'POST', {}, JSON.stringify({ email, name, password }));
  return req.json();
}

export async function getProfile(token, userId) {
  const headers = {
    ...credentialsHeaders(token),
    'ngrok-skip-browser-warning': 'true',
  }
  const req = await request(`${API_BASE_URL}${API_USERS_PATH}/${userId}`, 'GET', headers, null);
  return req.json();
}

export async function getTransactions(token) {
  const headers = {
    ...credentialsHeaders(token),
    'ngrok-skip-browser-warning': 'true',
  }
  const req = await request(`${API_BASE_URL}${API_TRANSACTIONS_PATH}`, 'GET', headers, null);
  return req.json();
}

function credentialsHeaders(token: string) {
  return { Authorization: `Bearer ${token}`};
}

async function request(uri, method, headers, body?) {
  return fetch(uri, {
    method, 
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  })
}