"use client";

import { jwtDecode } from "jwt-decode";

interface UserData {
  id: number;
  email: string;
}

export const saveToken = (token: string) => {
  const credentials = jwtDecode<UserData>(token);
  localStorage.setItem("auth-token", token);
  localStorage.setItem("auth-user", JSON.stringify(credentials));
};

export const getToken = (): string => {
  const token = localStorage.getItem("auth-token");
  if (typeof token !== "string") {
    throw new Error("no token");
  }
  return token;
};

export const isAuthenticated = () => {
  const token = getToken();
  return token !== null;
};

export const getUser = (): UserData => {
  const user = localStorage.getItem("auth-user");
  if (!user) {
    throw new Error("no user in storage");
  }
  return JSON.parse(user);
};

export const logout = () => {
  localStorage.removeItem("auth-token");
  localStorage.removeItem("auth-user");
};
