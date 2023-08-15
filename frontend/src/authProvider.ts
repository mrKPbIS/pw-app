import { AuthProvider, HttpError } from "react-admin";
import jwtDecode from 'jwt-decode';
import { API_BASE_URL } from "./constants";
import { post } from "./transport";

export const authProvider: AuthProvider = {
  login: async ({ username: email, password }) => {

    const r = await post('auth/login', null, JSON.stringify({ email, password }))
    const { success, error, data } = await r.json();
    if (!success) {
      throw new HttpError(error.message, error.code, { message: error.message});
    }
    const tokenData = jwtDecode<{ id: string, email: string }>(data);
    localStorage.setItem('auth', data);
    localStorage.setItem('user', JSON.stringify(tokenData));
    return { redirectTo: '/'};
    
  },
  logout: () => {
    localStorage.removeItem("auth");
    return Promise.resolve();
  },
  checkError: (error) => {
    if (error.code === 401 || error.code === 403) {
      localStorage.removeItem('auth');
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    const token = localStorage.getItem('auth');
    if (!token) {
      return Promise.reject();
    }
    const tokenData = jwtDecode(token);
    if (!tokenData) {
      return Promise.reject();
    }
    // if (tokenData.exp && Date.now() < tokenData.iat + tokenData.exp) {
    //   return Promise.reject({ message: 'Session expired' });
    // }
    return Promise.resolve();
  },
  getPermissions: () => {
    return Promise.resolve(undefined);
  },
  getIdentity: () => {
    let user = localStorage.getItem('user');
    if (user) {
      return Promise.resolve(JSON.parse(user));
    } else {
      const token = localStorage.getItem('auth');
      if (!token) {
        return Promise.reject();
      }
      const tokenData = jwtDecode<{ id: string, email: string }>(token);
      if (!tokenData) {
        return Promise.reject();
      }
      const { id, email } = tokenData;
      return Promise.resolve({ id, email });
    }
  },
};

export default authProvider;
