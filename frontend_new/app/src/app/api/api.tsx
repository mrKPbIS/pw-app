import { API_BASE_URL } from '../../constants';

const API_LOGIN_PATH = '/api/auth/login';
const API_REGISTER_PATH = '/api/auth/register';
const API_USERS_PATH = '/api/users';
const API_TRANSACTIONS_PATH = '/api/transactions';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

interface CreateTransactionRequest {
  recipientId: number;
  amount: string;
}

interface GetUsersResponse {
  users: GetUsersItemResponse[];
  count: number;
}

interface GetUsersItemResponse {
    id: number;
    name: string;
    email: string;
    balance: string;
}

interface GetTransactionsResponse {
  transactions: GetTransactionsItemResponse[];
  count: number;
}

export interface GetTransactionsItemResponse {
    id: number;
    ownerId: number;
    recipientId: number;
    amount: string;
    ownerBalance: string;
    recipientBalance: string;
    createdAt: Date;
    owner: GetUsersItemResponse;
    recipient: GetUsersItemResponse;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorResponse;
}

interface ApiErrorResponse {
  code: number;
  message: string;
}

export async function login(payload: LoginRequest) {
  const res = await request<string>(`${API_BASE_URL}${API_LOGIN_PATH}`, 'POST', {}, JSON.stringify(payload));
  return res;
}

export async function register(payload: RegisterRequest) {
  const res = await request<string>(`${API_BASE_URL}${API_REGISTER_PATH}`, 'POST', {}, JSON.stringify(payload));
  return res;
}

export async function createTransaction(payload: CreateTransactionRequest, token: string) {
  const headers = {
    ...credentialsHeaders(token),
  }
  const res = await request<GetTransactionsResponse>(`${API_BASE_URL}${API_TRANSACTIONS_PATH}`, 'POST', headers, JSON.stringify(payload));
  return res;
}

export async function getProfile(token: string, userId: number) {
  const headers = {
    ...credentialsHeaders(token),
    'ngrok-skip-browser-warning': 'true',
  }
  const res = await request<GetUsersItemResponse>(`${API_BASE_URL}${API_USERS_PATH}/${userId}`, 'GET', headers, null);
  return res;
}

export async function getUsers(token: string) {
  const headers = {
    ...credentialsHeaders(token),
    'ngrok-skip-browser-warning': 'true',
  }
  const res = await request<GetUsersResponse>(`${API_BASE_URL}${API_USERS_PATH}`, 'GET', headers, null);
  return res;
}

export async function getTransactions(token: string) {
  const headers = {
    ...credentialsHeaders(token),
    'ngrok-skip-browser-warning': 'true',
  }
  const res = await request<GetTransactionsResponse>(`${API_BASE_URL}${API_TRANSACTIONS_PATH}`, 'GET', headers, null);
  return res;
}

function credentialsHeaders(token: string) {
  return { Authorization: `Bearer ${token}`};
}

async function request<T>(uri: string, method: 'GET' | 'POST', headers: { [key: string]: string }, body: BodyInit | null): Promise<ApiResponse<T>> {
  try {
    const req = await fetch(uri, {
      method, 
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body,
    });
    return req.json();
  } catch(e) {
    console.log(e);
    throw e;
  }
}